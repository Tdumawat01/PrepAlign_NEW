"""SerpAPI Google Jobs provider."""
from __future__ import annotations
import os
import re
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import hashlib

import serpapi

from . import JobProvider

_REL_RE = re.compile(r"(\d+)\s+(minute|hour|day|week|month)s?\s+ago", re.I)


def _parse_relative_date(raw: Optional[str], now: datetime) -> Optional[datetime]:
    """Parse SerpAPI's human-readable posting dates like '3 days ago' → UTC datetime."""
    if not raw:
        return None
    m = _REL_RE.search(raw)
    if not m:
        # Handle "just posted", "today", "yesterday"
        low = raw.lower()
        if "just" in low or "today" in low:
            return now
        if "yesterday" in low:
            return now - timedelta(days=1)
        return None
    n, unit = int(m.group(1)), m.group(2).lower()
    if unit == "minute":
        return now - timedelta(minutes=n)
    if unit == "hour":
        return now - timedelta(hours=n)
    if unit == "day":
        return now - timedelta(days=n)
    if unit == "week":
        return now - timedelta(weeks=n)
    if unit == "month":
        return now - timedelta(days=30 * n)
    return None


def _stable_id(company: Optional[str], title: Optional[str], location: Optional[str]) -> str:
    """Fallback deterministic ID when SerpAPI doesn't provide job_id."""
    key = f"{(company or '').strip().lower()}|{(title or '').strip().lower()}|{(location or '').strip().lower()}"
    return hashlib.sha1(key.encode()).hexdigest()[:16]


class SerpApiGoogleJobsProvider(JobProvider):
    provider_name = "serpapi_google_jobs"

    def __init__(self, api_key: Optional[str] = None, country: str = "in", location: str = "India"):
        self.api_key = api_key or os.environ.get("SERPAPI_KEY", "")
        self.country = country
        self.location = location

    def _search_sync(self, query: str) -> dict:
        client = serpapi.Client(api_key=self.api_key)
        return client.search({
            "engine": "google_jobs",
            "q": query,
            "location": self.location,
            "hl": "en",
            "gl": self.country,
        })

    async def fetch_jobs(self, queries: List[str]) -> List[Dict[str, Any]]:
        if not self.api_key:
            raise RuntimeError("SERPAPI_KEY not configured")

        now = datetime.now(timezone.utc)

        async def _fetch_one(query: str) -> List[Dict[str, Any]]:
            try:
                raw = await asyncio.to_thread(self._search_sync, query)
            except Exception as e:
                # Fail-soft per query; other queries still run
                print(f"[serpapi] error for '{query}': {e}")
                return []

            results = raw.get("jobs_results", []) or []
            normalized: List[Dict[str, Any]] = []
            for job in results:
                title = job.get("title")
                company = job.get("company_name")
                location = job.get("location")
                logo_url = job.get("thumbnail")

                ext = job.get("detected_extensions", {}) or {}
                employment_type = ext.get("schedule_type") or ext.get("employment_type")
                posted_at_raw = ext.get("posted_at")
                posted_at_dt = _parse_relative_date(posted_at_raw, now)
                salary = ext.get("salary") or job.get("salary")

                apply_options = job.get("apply_options") or []
                apply_link = None
                if apply_options:
                    first = apply_options[0] if isinstance(apply_options, list) else None
                    if isinstance(first, dict):
                        apply_link = first.get("link") or first.get("apply_link")
                if not apply_link:
                    apply_link = job.get("share_link") or job.get("related_links", [{}])[0].get("link") if job.get("related_links") else None

                remote_hint = (
                    bool(ext.get("work_from_home"))
                    or "remote" in (location or "").lower()
                    or "remote" in (title or "").lower()
                )
                is_internship = "intern" in (title or "").lower() or (employment_type or "").lower() == "internship"

                provider_job_id = job.get("job_id") or _stable_id(company, title, location)

                normalized.append({
                    "provider": self.provider_name,
                    "provider_job_id": provider_job_id,
                    "queries": [query],
                    "title": title,
                    "company": company,
                    "logo_url": logo_url,
                    "location": location,
                    "employment_type": employment_type,
                    "salary": salary,
                    "posted_at_raw": posted_at_raw,
                    "posted_at": posted_at_dt.isoformat() if posted_at_dt else None,
                    "apply_link": apply_link,
                    "is_remote": remote_hint,
                    "is_internship": is_internship,
                    "fetched_at": now.isoformat(),
                })
            return normalized

        results_nested = await asyncio.gather(*[_fetch_one(q) for q in queries])
        return [j for sub in results_nested for j in sub]
