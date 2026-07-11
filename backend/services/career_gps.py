"""PrepAlign Career GPS — rule-based scoring engine + roadmap templates.

Designed to be modular: the top-level `assess()` function has a stable
signature so we can later swap the internal scoring for an LLM-based
approach without touching the API layer or frontend.
"""
from __future__ import annotations
import re
import json
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional

import httpx

from config import get_openrouter, openrouter_headers


# --------- Role profiles ---------
# Each role advertises how much it values each dimension.
# Interests / working styles are boolean matches (1 or 0).
# Skills use per-skill weights against the 1-5 rating (normalized to 0-1).
# Goals map to soft +/- multipliers.
#
# Rule of thumb weights (interests + styles combined per role should sum around 1.0):
ROLE_PROFILES: Dict[str, Dict[str, Any]] = {
    "Founder's Office": {
        "interests": {"Business": 0.9, "Product": 0.6, "Operations": 0.7, "AI": 0.5, "Marketing": 0.4},
        "styles":    {"Leadership": 1.0, "Analytical": 0.6, "Startup Environment": 1.0},
        "skills":    {"Communication": 0.9, "Problem Solving": 1.0, "Excel/Analytics": 0.6, "Public Speaking": 0.6, "Creativity": 0.4},
        "goals":     {"startup": 1.0, "leadership_goal": {"Founder": 1.0, "Team Lead": 0.6}, "ai_interest_high": 0.4},
        "salary":    "₹8-18 LPA",
        "skills_to_learn": ["Business analysis", "Founder communication", "Fundraising basics", "Cross-functional ops"],
        "why_seed":  "You blend business thinking, ownership, and cross-functional problem-solving — exactly what founders need in a chief-of-staff seat.",
    },
    "GTM Engineer": {
        "interests": {"Marketing": 0.7, "Product": 0.6, "Data": 0.8, "AI": 0.9, "Operations": 0.4},
        "styles":    {"Analytical": 0.9, "Client-facing": 0.6, "Startup Environment": 0.7},
        "skills":    {"Problem Solving": 0.9, "Excel/Analytics": 1.0, "Communication": 0.6, "Creativity": 0.5},
        "goals":     {"startup": 0.8, "ai_interest_high": 1.0, "remote": 0.4},
        "salary":    "₹12-24 LPA",
        "skills_to_learn": ["No-code stack", "SQL & analytics", "AI-augmented outreach", "Funnel design"],
        "why_seed":  "You're analytical, AI-curious, and love shipping fast — GTM Engineering is the hottest revenue role in 2026.",
    },
    "Product Operations": {
        "interests": {"Product": 1.0, "Operations": 1.0, "Data": 0.5, "Business": 0.5},
        "styles":    {"Analytical": 0.9, "Leadership": 0.4, "Client-facing": 0.4},
        "skills":    {"Problem Solving": 0.9, "Excel/Analytics": 0.8, "Communication": 0.7, "Creativity": 0.4},
        "goals":     {"startup": 0.6, "leadership_goal": {"Team Lead": 0.5}},
        "salary":    "₹8-16 LPA",
        "skills_to_learn": ["Roadmap orchestration", "Release management", "Data storytelling", "Notion mastery"],
        "why_seed":  "You think in systems and enjoy making messy teams ship — Product Ops is the connective tissue of every product org.",
    },
    "Product Design": {
        "interests": {"Design": 1.0, "Product": 0.9, "AI": 0.5},
        "styles":    {"Creative": 1.0, "Client-facing": 0.5, "Startup Environment": 0.5},
        "skills":    {"Creativity": 1.0, "Problem Solving": 0.8, "Communication": 0.6},
        "goals":     {"remote": 0.5, "ai_interest_high": 0.5},
        "salary":    "₹10-22 LPA",
        "skills_to_learn": ["Figma prototyping", "Design systems", "User research", "AI-native interfaces"],
        "why_seed":  "You're visually driven and love solving user problems — Product Design is the fastest path from craft to impact.",
    },
    "Brand & Content": {
        "interests": {"Content": 1.0, "Marketing": 0.9, "Design": 0.5, "AI": 0.4},
        "styles":    {"Creative": 1.0, "Client-facing": 0.4, "Startup Environment": 0.5},
        "skills":    {"Creativity": 1.0, "Communication": 1.0, "Public Speaking": 0.5},
        "goals":     {"remote": 0.6, "ai_interest_high": 0.3},
        "salary":    "₹6-14 LPA",
        "skills_to_learn": ["Long-form writing", "Brand storytelling", "Content ops", "AI-assisted content"],
        "why_seed":  "You have taste, voice, and love shaping how a company is perceived — brand craft is a compounding career asset.",
    },
    "Community": {
        "interests": {"Content": 0.6, "Marketing": 0.6, "Operations": 0.5, "Business": 0.4},
        "styles":    {"Client-facing": 1.0, "Creative": 0.5, "Leadership": 0.6, "Startup Environment": 0.6},
        "skills":    {"Communication": 1.0, "Public Speaking": 0.9, "Creativity": 0.6},
        "goals":     {"remote": 0.5, "leadership_goal": {"Team Lead": 0.5}},
        "salary":    "₹6-12 LPA",
        "skills_to_learn": ["Event ops", "Discord/Slack moderation", "Community growth loops", "Metrics that matter"],
        "why_seed":  "You energize rooms and love people — community-led growth is one of the strongest moats a startup can build.",
    },
    "Customer Success": {
        "interests": {"Business": 0.7, "Operations": 0.5, "Product": 0.5},
        "styles":    {"Client-facing": 1.0, "Analytical": 0.5, "Leadership": 0.4},
        "skills":    {"Communication": 1.0, "Problem Solving": 0.8, "Public Speaking": 0.6},
        "goals":     {"remote": 0.4},
        "salary":    "₹7-15 LPA",
        "skills_to_learn": ["Onboarding playbooks", "Churn analytics", "Upsell conversations", "CRM mastery"],
        "why_seed":  "You listen well and solve problems empathetically — CS is where the best product operators are minted.",
    },
    "Marketing": {
        "interests": {"Marketing": 1.0, "Content": 0.7, "Data": 0.6, "AI": 0.5},
        "styles":    {"Creative": 0.7, "Analytical": 0.7, "Client-facing": 0.4},
        "skills":    {"Creativity": 0.8, "Communication": 0.9, "Excel/Analytics": 0.7},
        "goals":     {"remote": 0.5, "ai_interest_high": 0.5},
        "salary":    "₹8-18 LPA",
        "skills_to_learn": ["Performance marketing basics", "Positioning frameworks", "Growth loops", "AI copy stacks"],
        "why_seed":  "You mix creative intuition with numbers — modern marketing is exactly this fusion.",
    },
    "Business Operations": {
        "interests": {"Business": 1.0, "Operations": 1.0, "Data": 0.7},
        "styles":    {"Analytical": 1.0, "Leadership": 0.5},
        "skills":    {"Problem Solving": 1.0, "Excel/Analytics": 1.0, "Communication": 0.7},
        "goals":     {"startup": 0.5, "leadership_goal": {"Team Lead": 0.5, "Founder": 0.4}},
        "salary":    "₹8-18 LPA",
        "skills_to_learn": ["Excel/Sheets modeling", "SQL", "Operations dashboards", "Strategy memos"],
        "why_seed":  "You bring structure and rigor — Biz Ops sits at the heart of every scaling company.",
    },
    "Video/Graphic Design": {
        "interests": {"Design": 1.0, "Content": 0.8, "AI": 0.4},
        "styles":    {"Creative": 1.0, "Startup Environment": 0.4},
        "skills":    {"Creativity": 1.0, "Communication": 0.5},
        "goals":     {"remote": 0.7, "ai_interest_high": 0.4},
        "salary":    "₹5-12 LPA",
        "skills_to_learn": ["Figma / Illustrator", "Video editing (Premiere/CapCut)", "Motion basics", "AI-powered creative tools"],
        "why_seed":  "You have visual instinct and love making ideas look sharp — the creator economy rewards this compounding craft.",
    },
}


# --------- 8-week roadmap templates ---------
ROADMAPS: Dict[str, List[str]] = {
    "Founder's Office": [
        "Read 'The Great CEO Within' + write a 1-page 'why founder's office' memo",
        "Reverse-engineer 3 founders' decisions from public posts; publish takeaways",
        "Cold-DM 10 founders on LinkedIn with a specific value-add",
        "Build a 'startup teardown' portfolio (2 companies deep-dive)",
        "Learn basic financial modelling in Google Sheets (unit economics)",
        "Ghost-write / draft 3 external comms pieces for a small startup",
        "Volunteer 20 hours with a founder — meeting notes, research, follow-ups",
        "Ship a public case study + apply to 5 curated openings",
    ],
    "GTM Engineer": [
        "Master 3 tools: Clay + HubSpot + Zapier (build a starter stack)",
        "Study 5 outbound sequences that worked — annotate & rebuild",
        "Learn SQL basics (SELECT, JOIN, GROUP BY) for pipeline reporting",
        "Set up an AI-augmented outbound experiment on a real cause",
        "Build a personal 'GTM lab' — track metrics on a mini campaign",
        "Publish a public teardown of a company's funnel + suggestions",
        "Contribute in a startup community (Slack/Discord) with GTM answers",
        "Ship a portfolio site + apply to 5 GTM openings",
    ],
    "Product Operations": [
        "Read 'Escaping the Build Trap' + summarize your top 5 takeaways",
        "Reverse-engineer a product launch from a company you admire",
        "Master Notion + Linear/Jira — build a 'fake' product plan template",
        "Interview 3 PMs about their pain points and publish notes",
        "Learn basic SQL + data storytelling (Google Sheets / Metabase)",
        "Volunteer to run standups / release notes for a student org",
        "Publish a case study on a launch you observed",
        "Apply to 5 Product Ops / APM roles with tailored notes",
    ],
    "Product Design": [
        "Complete Figma essentials + rebuild 2 popular apps' key screens",
        "Study 3 design systems (Airbnb, Stripe, Notion) and note patterns",
        "Do 1 user interview per week (5 total) — publish insights",
        "Ship a redesign case study on Read.cv / Behance",
        "Learn design tokens + component libraries in Figma",
        "Build a small AI-native UI prototype (chat/agent flow)",
        "Post weekly on Twitter/LinkedIn — 4 detailed craft threads",
        "Apply to 5 junior Product Design openings with a portfolio",
    ],
    "Brand & Content": [
        "Write 5 tweets and 1 long-form piece per week (public accountability)",
        "Study 3 brand voices (Wendy's, Notion, Zomato) — write a doc",
        "Interview a founder or operator + publish a 1500-word feature",
        "Build a mini newsletter (Substack/Beehiiv) with 100 subscribers",
        "Learn AI-assisted content: Claude for drafts, Midjourney for visuals",
        "Contribute to a startup's blog or Twitter as a freelancer",
        "Publish a 'brand teardown' of a company you love",
        "Apply to 5 Content / Brand roles with clips + portfolio",
    ],
    "Community": [
        "Join 3 active communities (Discord/Slack) and observe rituals",
        "Volunteer to help organize a small IRL meetup in your city",
        "Interview a Community Manager & publish a takeaway thread",
        "Design a 'community charter' for a hypothetical startup",
        "Host a mini AMA or workshop with a niche audience (50 people)",
        "Track 3 metrics: DAU, message velocity, engagement — write memo",
        "Ship a case study of the meetup you organized",
        "Apply to 5 Community roles with concrete examples",
    ],
    "Customer Success": [
        "Read 'Onboarding Matters' + write a personal 1-pager on empathy",
        "Shadow 5 support tickets on a public forum — write your version",
        "Learn a CRM: HubSpot free tier + Intercom demo",
        "Study 3 SaaS onboarding flows — publish a teardown",
        "Volunteer with a small SaaS for 5 onboarding calls",
        "Track NPS-style feedback from users you help",
        "Publish a case study on churn reasons + prevention playbook",
        "Apply to 5 CS Associate / Onboarding Specialist roles",
    ],
    "Marketing": [
        "Learn positioning: read 'Obviously Awesome' + apply to 2 brands",
        "Run a personal LinkedIn experiment — 4 weeks of daily posts",
        "Learn Meta / Google Ads basics with free tutorials",
        "Study 3 marketing case studies (0→1 growth stories)",
        "Build a landing page + A/B test copy with a free tool",
        "Publish a growth teardown of a company's public funnel",
        "Interview 2 marketers and publish a career-path piece",
        "Apply to 5 marketing openings with portfolio + numbers",
    ],
    "Business Operations": [
        "Master Google Sheets: pivot tables, VLOOKUP, XLOOKUP",
        "Learn SQL fundamentals (LearnSQL / DataCamp free tier)",
        "Build a startup financial model from scratch (SaaS unit economics)",
        "Study 3 BizOps case studies from public S-1 filings",
        "Ship a mini Airtable dashboard for a real problem",
        "Interview a BizOps lead + write a public thread",
        "Publish a strategy memo on a startup you follow",
        "Apply to 5 BizOps / Strategy roles",
    ],
    "Video/Graphic Design": [
        "Complete Figma + Illustrator basics; rebuild 3 famous logos",
        "Learn CapCut / Premiere Pro — publish 5 short videos",
        "Study 3 top brand identities and write a takeaway note",
        "Build a portfolio site (Behance / Framer) with 8 pieces",
        "Learn motion basics: Rive / After Effects intro tutorials",
        "Offer 5 free redesigns to indie creators — get testimonials",
        "Post weekly on Twitter + Instagram — build a small following",
        "Apply to 5 Design roles with a link-first portfolio",
    ],
}


def _score_role(role: str, profile: dict, answers: dict) -> float:
    interests = set(answers.get("interests") or [])
    styles = set(answers.get("styles") or [])
    skills = answers.get("skills") or {}  # {name: 1-5}
    goals = answers.get("goals") or {}

    # Interest match
    int_score = sum(w for name, w in profile["interests"].items() if name in interests)
    int_max = sum(profile["interests"].values()) or 1

    # Working style match
    sty_score = sum(w for name, w in profile["styles"].items() if name in styles)
    sty_max = sum(profile["styles"].values()) or 1

    # Skills — rating/5 * weight
    sk_score = 0.0
    sk_max = 0.0
    for name, w in profile["skills"].items():
        rating = float(skills.get(name, 0)) / 5.0
        sk_score += rating * w
        sk_max += w

    # Goal boosts (multipliers, capped)
    goal_boost = 1.0
    role_goals = profile.get("goals", {})
    if goals.get("startup_vs_mnc") == "Startup" and "startup" in role_goals:
        goal_boost += 0.05 * role_goals["startup"]
    if goals.get("remote_vs_office") in ("Remote", "Hybrid") and "remote" in role_goals:
        goal_boost += 0.03 * role_goals["remote"]
    if goals.get("ai_interest") == "Very high" and role_goals.get("ai_interest_high"):
        goal_boost += 0.05 * role_goals["ai_interest_high"]
    lg_map = role_goals.get("leadership_goal") or {}
    lg = goals.get("leadership_goal")
    if lg and lg in lg_map:
        goal_boost += 0.05 * lg_map[lg]

    # Weighted composite (interest 0.35, style 0.25, skills 0.40)
    composite = (
        0.35 * (int_score / int_max) +
        0.25 * (sty_score / sty_max) +
        0.40 * (sk_score / sk_max if sk_max else 0)
    ) * goal_boost

    return max(0.0, min(1.0, composite))


def _why_fit(role: str, profile: dict, answers: dict) -> str:
    interests = set(answers.get("interests") or [])
    styles = set(answers.get("styles") or [])
    hits = []
    for name in profile["interests"]:
        if name in interests:
            hits.append(name.lower())
    for name in profile["styles"]:
        if name in styles:
            hits.append(name.lower())
    hits = hits[:3]

    base = profile.get("why_seed", "")
    if hits:
        joined = ", ".join(hits)
        return f"{base} Your signals: {joined}."
    return base


def assess(answers: dict) -> dict:
    """Return top-5 role matches + roadmap for the top role.

    `answers` shape:
      {
        "profile": { current_status, degree, graduation_year },
        "interests": ["Product", "AI", ...],
        "styles":    ["Analytical", ...],
        "skills":    { "Communication": 4, ... },  # 1-5
        "goals":     { startup_vs_mnc, remote_vs_office, leadership_goal, salary_expectation, ai_interest }
      }
    """
    scored = []
    for role, profile in ROLE_PROFILES.items():
        score = _score_role(role, profile, answers)
        scored.append({
            "role": role,
            "match": round(score * 100),
            "why": _why_fit(role, profile, answers),
            "salary": profile["salary"],
            "skills_to_learn": profile["skills_to_learn"],
        })

    scored.sort(key=lambda x: x["match"], reverse=True)
    top5 = scored[:5]

    # Guarantee a 60-98 range for readability, without changing order
    if top5:
        top_raw = top5[0]["match"] or 1
        for i, item in enumerate(top5):
            # Compress into 68..96
            spread = 98 - (i * 6)
            item["match"] = max(60, min(98, spread))

    top_role = top5[0]["role"] if top5 else "Founder's Office"
    weeks = ROADMAPS.get(top_role) or ROADMAPS["Founder's Office"]
    roadmap = [
        {"week": i + 1, "milestone": w}
        for i, w in enumerate(weeks)
    ]

    return {
        "top_matches": top5,
        "top_role": top_role,
        "roadmap": roadmap,
    }


# =========================================================
# AI-personalized roadmap (OpenRouter)
# =========================================================

_ROADMAP_CACHE_DAYS = 30


_ROADMAP_SYSTEM = (
    "You are PrepAlign's expert career coach for Indian Tier-2/3 students breaking into AI & startup roles. "
    "Given a target role and the user's profile, output a JSON object with a highly personalized 8-week roadmap.\n\n"
    "STRICT SCHEMA:\n"
    '{"weeks": [{"week": 1, "milestone": "...", "tasks": ["...", "..."], "articles": [{"title": "...", "url": "..."}], "videos": [{"title": "...", "url": "..."}]}, ...]}\n\n'
    "Rules:\n"
    "- Exactly 8 week objects.\n"
    "- milestone: 1 sentence, action-oriented.\n"
    "- tasks: 2–4 concrete bullet actions (imperative verbs; time-bounded).\n"
    "- articles: 1–2 links. Prefer WELL-KNOWN, STABLE sources (First Round Review firstround.com, Lenny's Newsletter lennysnewsletter.com, Reforge reforge.com, YC yc.com, Notion Guides notion.com/guides, Nir Eyal nirandfar.com, Product Coalition medium.com/tag/product-management, HBR hbr.org, Ness Labs nesslabs.com). Do not invent obscure URLs.\n"
    "- videos: 1–2 links. Prefer YouTube channel or topic search links that are safe: use https://www.youtube.com/results?search_query=<terms> if unsure of specific video URLs. You may also link YouTube channels (Y Combinator, Lenny's Podcast, Ness Wadia, GaryVee, Ali Abdaal, First Round Review, Sahil Bloom).\n"
    "- Adapt language to the user's current status (student vs early-career).\n"
    "- Keep it India-centric where useful (INR context, Indian startup examples).\n"
    "- Progression: weeks 1–2 foundations, 3–4 skill building, 5–6 portfolio/proof of work, 7–8 outreach and application.\n"
    "- Return ONLY valid JSON. No markdown fences, no commentary."
)


def _roadmap_cache_key(role: str, answers: dict) -> str:
    """Hash by role + degree + status + top interests — one roadmap per profile shape."""
    prof = answers.get("profile") or {}
    interests = sorted(answers.get("interests") or [])[:5]
    payload = json.dumps({
        "role": role,
        "degree": prof.get("degree"),
        "status": prof.get("current_status"),
        "interests": interests,
    }, sort_keys=True)
    return hashlib.sha1(payload.encode()).hexdigest()[:24]


def _extract_json_block(text: str) -> Optional[dict]:
    if not text:
        return None
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.I | re.M)
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{.*\}", text, flags=re.S)
        if not m:
            return None
        try:
            return json.loads(m.group(0))
        except Exception:
            return None


async def _call_openrouter_for_roadmap(role: str, answers: dict) -> Optional[dict]:
    cfg = get_openrouter()
    if not cfg.configured:
        return None

    prof = answers.get("profile") or {}
    goals = answers.get("goals") or {}
    user_msg = (
        f"Target role: {role}\n"
        f"Current status: {prof.get('current_status') or 'N/A'}\n"
        f"Degree: {prof.get('degree') or 'N/A'}, Grad year: {prof.get('graduation_year') or 'N/A'}\n"
        f"Interests: {', '.join(answers.get('interests') or []) or 'N/A'}\n"
        f"Working styles: {', '.join(answers.get('styles') or []) or 'N/A'}\n"
        f"Skill self-ratings (1–5): {json.dumps(answers.get('skills') or {})}\n"
        f"Career goals: {json.dumps(goals)}\n"
        "\nReturn the JSON now."
    )

    payload = {
        "model": cfg.roadmap_model,
        "messages": [
            {"role": "system", "content": _ROADMAP_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        "temperature": 0.4,
        "max_tokens": 1800,
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=45) as http:
        r = await http.post(
            cfg.base_url,
            json=payload,
            headers=openrouter_headers("Career GPS"),
        )
    if r.status_code != 200:
        print(f"[career_gps] openrouter {r.status_code}: {r.text[:200]}")
        return None
    body = r.json()
    try:
        content = body["choices"][0]["message"]["content"]
    except Exception:
        return None
    parsed = _extract_json_block(content)
    if not parsed or "weeks" not in parsed:
        return None
    weeks = parsed.get("weeks") or []
    if not isinstance(weeks, list) or len(weeks) == 0:
        return None
    # Normalize & clamp to 8 weeks
    norm = []
    for i, w in enumerate(weeks[:8]):
        norm.append({
            "week": w.get("week") or (i + 1),
            "milestone": (w.get("milestone") or "").strip() or f"Week {i + 1} focus",
            "tasks": [str(t).strip() for t in (w.get("tasks") or []) if str(t).strip()][:5],
            "articles": [
                {"title": str(a.get("title") or a.get("url") or "Article"), "url": str(a.get("url") or "").strip()}
                for a in (w.get("articles") or []) if isinstance(a, dict) and a.get("url")
            ][:3],
            "videos": [
                {"title": str(v.get("title") or v.get("url") or "Video"), "url": str(v.get("url") or "").strip()}
                for v in (w.get("videos") or []) if isinstance(v, dict) and v.get("url")
            ][:3],
        })
    return {"weeks": norm}


async def generate_personalized_roadmap(db, role: str, answers: dict, force: bool = False) -> dict:
    """Cache-aside AI-personalized roadmap. Falls back to static template if LLM unavailable."""
    key = _roadmap_cache_key(role, answers)
    now = datetime.now(timezone.utc)

    if not force:
        cached = await db.career_gps_roadmaps.find_one({"_id": key}, {"_id": 0})
        if cached and cached.get("fetched_at"):
            try:
                dt = datetime.fromisoformat(cached["fetched_at"])
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if now - dt < timedelta(days=_ROADMAP_CACHE_DAYS):
                    return {"role": role, "roadmap": cached.get("roadmap") or [], "source": "cache"}
            except Exception:
                pass

    ai = await _call_openrouter_for_roadmap(role, answers)
    if not ai:
        # Fallback to static template
        weeks = ROADMAPS.get(role) or ROADMAPS["Founder's Office"]
        roadmap = [{"week": i + 1, "milestone": w, "tasks": [], "articles": [], "videos": []} for i, w in enumerate(weeks)]
        return {"role": role, "roadmap": roadmap, "source": "fallback"}

    roadmap = ai["weeks"]
    await db.career_gps_roadmaps.update_one(
        {"_id": key},
        {
            "$set": {
                "role": role,
                "roadmap": roadmap,
                "fetched_at": now.isoformat(),
                "model": get_openrouter().roadmap_model,
            }
        },
        upsert=True,
    )
    return {"role": role, "roadmap": roadmap, "source": "openrouter"}
