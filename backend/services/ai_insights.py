"""AI insights via OpenRouter (OpenAI-compatible).

Given a company name (+ optional job context), returns:
  - preview: 2-3 sentence company description
  - salary_range_estimate: Indian salary band for the given role, if inferrable
  - founder_name: founder / CEO name(s), if publicly known

All calls are cached in MongoDB (`company_insights` collection) keyed by
lowercased company name to avoid repeated LLM calls for the same company.
"""
from __future__ import annotations
import os
import json
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import httpx


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-4o-mini"   # cheap + fast + universally available on OpenRouter
CACHE_TTL_DAYS = 30


SYSTEM = (
    "You are a concise research assistant for a career platform. "
    "Given a company name and a job context, return a compact JSON object with: "
    '{"preview": "...", "salary_range_estimate": "...", "founder_name": "..."}. '
    "Rules:\n"
    "- preview: 2-3 factual sentences about what the company does. If unknown, set to null.\n"
    "- salary_range_estimate: an Indian salary band in INR LPA (e.g. \"₹6-10 LPA\") appropriate for the given job title/level in India. "
    "If the role/company is unknown, give a defensible market-typical range for the role and note that it is an estimate.\n"
    "- founder_name: full name of the founder(s) / CEO if publicly well-known. If not sure, set to null. Never guess.\n"
    "Return ONLY valid JSON. No prose, no markdown fences."
)


def _extract_json(text: str) -> Optional[dict]:
    if not text:
        return None
    # Strip ```json fences if the model returns them despite instructions
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.I | re.M)
    try:
        return json.loads(text)
    except Exception:
        # Try to extract first {...} block
        m = re.search(r"\{.*\}", text, flags=re.S)
        if not m:
            return None
        try:
            return json.loads(m.group(0))
        except Exception:
            return None


async def _call_openrouter(company: str, title: str, location: Optional[str]) -> Optional[dict]:
    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    if not api_key:
        return None
    user_msg = (
        f"Company: {company}\n"
        f"Role: {title or 'N/A'}\n"
        f"Location: {location or 'India'}\n"
        f"Return JSON per the schema."
    )
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        "temperature": 0.2,
        "max_tokens": 350,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://prepalign.app",
        "X-Title": "PrepAlign Jobs",
    }
    async with httpx.AsyncClient(timeout=30) as http:
        r = await http.post(OPENROUTER_URL, json=payload, headers=headers)
    if r.status_code != 200:
        print(f"[openrouter] {r.status_code}: {r.text[:200]}")
        return None
    body = r.json()
    try:
        content = body["choices"][0]["message"]["content"]
    except Exception:
        return None
    return _extract_json(content)


async def get_company_insights(
    db,
    company: str,
    title: str = "",
    location: Optional[str] = None,
    salary_hint: Optional[str] = None,
    force: bool = False,
) -> Dict[str, Any]:
    """Cache-aside insights. Returns {preview, salary_range_estimate, founder_name, cached, source}."""
    if not company:
        return {"preview": None, "salary_range_estimate": salary_hint, "founder_name": None, "source": "empty"}

    key = company.strip().lower()
    now = datetime.now(timezone.utc)

    if not force:
        existing = await db.company_insights.find_one({"_id": key}, {"_id": 0})
        if existing:
            fetched_at = existing.get("fetched_at")
            try:
                dt = datetime.fromisoformat(fetched_at) if fetched_at else None
                if dt and dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt and (now - dt) < timedelta(days=CACHE_TTL_DAYS):
                    return {
                        "preview": existing.get("preview"),
                        "salary_range_estimate": salary_hint or existing.get("salary_range_estimate"),
                        "founder_name": existing.get("founder_name"),
                        "source": "cache",
                        "cached_at": fetched_at,
                    }
            except Exception:
                pass

    result = await _call_openrouter(company, title, location)
    if not result:
        return {
            "preview": None,
            "salary_range_estimate": salary_hint,
            "founder_name": None,
            "source": "unavailable",
        }

    doc = {
        "company": company,
        "preview": result.get("preview"),
        "salary_range_estimate": result.get("salary_range_estimate"),
        "founder_name": result.get("founder_name"),
        "fetched_at": now.isoformat(),
        "model": MODEL,
    }
    await db.company_insights.update_one({"_id": key}, {"$set": doc}, upsert=True)

    return {
        "preview": doc["preview"],
        "salary_range_estimate": salary_hint or doc["salary_range_estimate"],
        "founder_name": doc["founder_name"],
        "source": "openrouter",
    }
