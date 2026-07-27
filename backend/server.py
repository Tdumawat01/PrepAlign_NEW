from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Header
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import httpx
import asyncio
import hashlib
from pymongo.errors import DuplicateKeyError

from rate_limit import enforce_rate_limit

from providers.serpapi_google_jobs import SerpApiGoogleJobsProvider
from services.ai_insights import get_company_insights
from services.career_gps import assess as career_gps_assess, generate_personalized_roadmap
from config import integration_status

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ---- Jobs config ----
JOB_QUERIES: List[str] = [
    "Founder's Office",
    "GTM Engineer",
    "Product Management",
    "Product Operations",
    "Product Design",
    "Brand & Content",
    "Marketing",
    "Community",
    "Business Analyst",
    "Data Analyst",
    "AI Operations",
    "Customer Success",
    "Startup Internships",
]
JOB_CACHE_TTL_HOURS = 24
_jobs_provider = SerpApiGoogleJobsProvider()
_jobs_refresh_lock = asyncio.Lock()

_ENV = (os.environ.get("ENV") or os.environ.get("ENVIRONMENT") or "").strip().lower()
_IS_PROD = _ENV in ("prod", "production")
app = FastAPI(
    title="PrepAlign API",
    docs_url=None if _IS_PROD else "/docs",
    redoc_url=None if _IS_PROD else "/redoc",
)
api_router = APIRouter(prefix="/api")


@app.get("/")
async def root_redirect():
    """Browser-friendly entry: API routes live under /api."""
    if _IS_PROD or app.docs_url is None:
        return {"ok": True, "api": "/api"}
    return RedirectResponse(url="/docs")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
_status = integration_status()
logger.info(
    "Integrations — openrouter=%s serpapi=%s mongo=%s",
    _status["openrouter"],
    _status["serpapi"],
    _status["mongo"],
)
# --------------- Models ---------------

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None

class SessionExchangeRequest(BaseModel):
    session_id: str = Field(..., min_length=8, max_length=512)

class WebinarRegistration(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)
    college: str = Field(..., min_length=1, max_length=160)
    interested_role: str = Field(..., min_length=1, max_length=120)
    referral_source: Optional[str] = Field(None, max_length=120)
    utm_source: Optional[str] = Field(None, max_length=120)
    utm_medium: Optional[str] = Field(None, max_length=120)
    utm_campaign: Optional[str] = Field(None, max_length=200)
    utm_term: Optional[str] = Field(None, max_length=120)
    utm_content: Optional[str] = Field(None, max_length=120)

class MentorshipRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=30)
    current_status: str = Field(..., min_length=1, max_length=120)
    target_role: str = Field(..., min_length=1, max_length=120)
    biggest_challenge: str = Field(..., min_length=1, max_length=500)
    help_needed: str = Field(..., min_length=1, max_length=2000)
    referral_source: Optional[str] = Field(None, max_length=120)
    utm_source: Optional[str] = Field(None, max_length=120)
    utm_medium: Optional[str] = Field(None, max_length=120)
    utm_campaign: Optional[str] = Field(None, max_length=200)
    utm_term: Optional[str] = Field(None, max_length=120)
    utm_content: Optional[str] = Field(None, max_length=120)

class WaitlistSignup(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=30)
    linkedin_url: Optional[str] = Field(None, max_length=300)
    current_role: str = Field(..., min_length=1, max_length=120)
    target_role: str = Field(..., min_length=1, max_length=120)
    biggest_challenge: str = Field(..., min_length=1, max_length=120)
    comments: Optional[str] = Field(None, max_length=2000)
    source: Optional[str] = Field(None, max_length=120)
    # Optional / legacy fields
    years_experience: Optional[str] = Field(None, max_length=40)
    career_goal: Optional[str] = Field(None, max_length=120)
    willingness_to_pay: Optional[str] = Field(None, max_length=40)
    location: Optional[str] = Field(None, max_length=120)
    current_company: Optional[str] = Field(None, max_length=120)
    applications_last_30_days: Optional[str] = Field(None, max_length=20)
    ai_tools: List[str] = Field(default_factory=list, max_length=20)
    one_problem: Optional[str] = Field(None, max_length=2000)
    utm_source: Optional[str] = Field(None, max_length=120)
    utm_medium: Optional[str] = Field(None, max_length=120)
    utm_campaign: Optional[str] = Field(None, max_length=200)
    utm_term: Optional[str] = Field(None, max_length=120)
    utm_content: Optional[str] = Field(None, max_length=120)

# --------------- Auth helpers ---------------

def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        return None
    token_hash = _hash_token(token)
    session = await db.user_sessions.find_one(
        {"$or": [{"session_token_hash": token_hash}, {"session_token": token}]},
        {"_id": 0},
    )
    if not session:
        return None
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user



def _admin_email_set() -> set:
    raw = os.environ.get("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("email", "").lower() not in _admin_email_set():
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# --------------- Routes ---------------

@api_router.get("/")
async def root():
    return {"message": "PrepAlign API"}


@api_router.get("/integrations/status")
async def integrations_status():
    """Whether external APIs are configured. Never returns secret values."""
    return integration_status()


# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def exchange_session(payload: SessionExchangeRequest, response: Response):
    """Exchange session_id from Emergent OAuth for a persistent session_token."""
    async with httpx.AsyncClient(timeout=15) as http:
        r = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json() if r.content else {}
    email = (data.get("email") or "").strip().lower()
    session_token = data.get("session_token")
    if not email or not session_token or not isinstance(session_token, str):
        raise HTTPException(status_code=401, detail="Invalid session payload")
    name = (data.get("name") or email).strip()[:200]
    picture = data.get("picture")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token_hash": _hash_token(session_token),
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture}

@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    is_admin = user.get("email", "").lower() in _admin_email_set()
    return {**User(**user).model_dump(), "is_admin": is_admin}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if token:
        token_hash = _hash_token(token)
        await db.user_sessions.delete_many(
            {"$or": [{"session_token_hash": token_hash}, {"session_token": token}]}
        )
    response.delete_cookie(
        "session_token",
        path="/",
        secure=True,
        httponly=True,
        samesite="none",
    )
    return {"ok": True}

# --------------- Lead capture ---------------

@api_router.post("/webinar/register")
async def register_webinar(payload: WebinarRegistration, request: Request):
    enforce_rate_limit(request, key="webinar", limit=8, window_sec=60)
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.webinar_registrations.insert_one(doc)
    return {"id": doc["id"], "ok": True, "message": "You're in! Join the WhatsApp group to get updates."}

@api_router.get("/webinar/registrations", response_model=List[dict])
async def list_webinar_registrations(request: Request):
    await require_admin(request)
    items = await db.webinar_registrations.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items

@api_router.post("/mentorship/request")
async def request_mentorship(payload: MentorshipRequest, request: Request):
    enforce_rate_limit(request, key="mentorship", limit=8, window_sec=60)
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.mentorship_requests.insert_one(doc)
    return {"id": doc["id"], "ok": True, "message": "हम आपसे 24-48 hours में संपर्क करेंगे"}

@api_router.get("/mentorship/requests", response_model=List[dict])
async def list_mentorship_requests(request: Request):
    await require_admin(request)
    items = await db.mentorship_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


@api_router.post("/waitlist/join")
async def join_waitlist(payload: WaitlistSignup, request: Request):
    """Validate signup, append to Google Sheets via Apps Script, mirror to Mongo."""
    enforce_rate_limit(request, key="waitlist", limit=8, window_sec=60)
    linkedin = (payload.linkedin_url or "").strip()
    if linkedin and not (linkedin.startswith("http://") or linkedin.startswith("https://")):
        raise HTTPException(status_code=400, detail="LinkedIn URL must start with http(s)://")

    phone = (payload.phone or "").strip()
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) < 7 or len(digits) > 15:
        raise HTTPException(status_code=400, detail="Please enter a valid phone number")
    if not all(c.isdigit() or c in " +()-." for c in phone):
        raise HTTPException(status_code=400, detail="Phone number contains invalid characters")
    # Normalize for Sheets: +E.164 with no spaces (Sheets mangles spaced / numeric phones)
    phone = ("+" if phone.strip().startswith("+") or len(digits) > 10 else "") + digits

    email = str(payload.email).strip().lower()
    source = (payload.source or payload.utm_source or "direct").strip()[:120] or "direct"
    utm_campaign = (payload.utm_campaign or "").strip()[:200] or None

    sheet_payload = {
        # snake_case (our Waitlist.gs) + camelCase (deployed PrepAlign script)
        "full_name": payload.full_name.strip(),
        "fullName": payload.full_name.strip(),
        "email": email,
        "phone": phone,
        "phoneNumber": phone,
        "linkedin_url": linkedin or "",
        "linkedinUrl": linkedin or "",
        "current_role": payload.current_role.strip(),
        "currentRole": payload.current_role.strip(),
        "target_role": payload.target_role.strip(),
        "targetRole": payload.target_role.strip(),
        "biggest_challenge": payload.biggest_challenge.strip(),
        "biggestChallenge": payload.biggest_challenge.strip(),
        "comments": (payload.comments or "").strip(),
        "additionalComments": (payload.comments or "").strip(),
        "source": source,
        "utm_campaign": utm_campaign or "",
        "utmCampaign": utm_campaign or "",
        "utm_source": (payload.utm_source or "").strip()[:120] or None,
        "utm_medium": (payload.utm_medium or "").strip()[:120] or None,
        "utm_term": (payload.utm_term or "").strip()[:120] or None,
        "utm_content": (payload.utm_content or "").strip()[:120] or None,
    }

    apps_script_url = (os.environ.get("GOOGLE_APPS_SCRIPT_WAITLIST_URL") or "").strip()
    waitlist_id = None
    sheet_message = "You're on the waitlist."

    if apps_script_url:
        try:
            async with httpx.AsyncClient(timeout=40.0, follow_redirects=True) as http:
                resp = await http.post(
                    apps_script_url,
                    json=sheet_payload,
                    headers={"Content-Type": "application/json"},
                )
            try:
                data = resp.json()
            except Exception:
                logging.exception("Apps Script returned non-JSON body")
                raise HTTPException(
                    status_code=502,
                    detail="Waitlist service returned an unexpected response. Please try again.",
                )

            if not (data.get("ok") or data.get("success")):
                code = data.get("code") or ""
                err_msg = (
                    data.get("error")
                    or data.get("message")
                    or "Could not join the waitlist."
                )
                if code == "duplicate" or "already" in str(err_msg).lower():
                    raise HTTPException(status_code=409, detail=err_msg)
                raise HTTPException(status_code=400, detail=err_msg)

            waitlist_id = (
                data.get("waitlist_id")
                or data.get("waitlistId")
                or data.get("id")
            )
            sheet_message = data.get("message") or sheet_message
        except HTTPException:
            raise
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Waitlist service timed out. Please try again in a moment.",
            )
        except Exception:
            logging.exception("Failed to reach Google Apps Script waitlist webhook")
            raise HTTPException(
                status_code=502,
                detail="Could not reach the waitlist service. Please try again.",
            )
    else:
        # Local / Mongo-only fallback when Apps Script is not configured
        existing = await db.waitlist_signups.find_one({"email": email}, {"_id": 0, "id": 1, "waitlist_id": 1})
        if existing:
            raise HTTPException(status_code=409, detail="This email is already on the waitlist.")
        waitlist_id = f"WL-{uuid.uuid4().hex[:8].upper()}"

    doc = {
        **sheet_payload,
        "linkedin_url": linkedin or None,
        "comments": (payload.comments or "").strip() or None,
        "source": source,
        "utm_campaign": utm_campaign,
        "status": "New",
        "waitlist_id": waitlist_id,
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # Unique email index prevents races; ignore duplicate on retry after Sheets success
    try:
        await db.waitlist_signups.insert_one(doc)
    except DuplicateKeyError:
        existing = await db.waitlist_signups.find_one({"email": email}, {"_id": 0, "waitlist_id": 1})
        return {
            "ok": True,
            "waitlist_id": (existing or {}).get("waitlist_id") or waitlist_id,
            "message": sheet_message,
        }

    return {
        "ok": True,
        "waitlist_id": waitlist_id,
        "message": sheet_message,
    }


@api_router.get("/waitlist/signups", response_model=List[dict])
async def list_waitlist_signups(request: Request):
    await require_admin(request)
    items = await db.waitlist_signups.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


# ---------- Jobs ----------

async def _refresh_jobs_cache() -> int:
    """Fetch fresh jobs from all providers and replace cache. Returns count."""
    async with _jobs_refresh_lock:
        # Double-check TTL under lock to avoid duplicate refreshes on stampede
        meta = await db.jobs_meta.find_one({"_id": "state"}, {"_id": 0})
        if meta and meta.get("last_refreshed_at"):
            last = datetime.fromisoformat(meta["last_refreshed_at"])
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) - last < timedelta(hours=JOB_CACHE_TTL_HOURS):
                # Fresh enough
                return await db.jobs.count_documents({})

        jobs = await _jobs_provider.fetch_jobs(JOB_QUERIES)

        # Dedupe by (provider, provider_job_id) — merge query lists
        merged: dict = {}
        for j in jobs:
            key = (j["provider"], j["provider_job_id"])
            if key in merged:
                existing = merged[key]
                existing_queries = set(existing.get("queries") or [])
                existing_queries.update(j.get("queries") or [])
                existing["queries"] = sorted(existing_queries)
            else:
                merged[key] = j

        docs = list(merged.values())

        # Drop expired: posted_at older than 60 days
        cutoff = datetime.now(timezone.utc) - timedelta(days=60)
        def _keep(j):
            pa = j.get("posted_at")
            if not pa:
                return True  # unknown date — keep
            try:
                dt = datetime.fromisoformat(pa)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt >= cutoff
            except Exception:
                return True
        docs = [j for j in docs if _keep(j)]

        # Replace cache atomically
        await db.jobs.delete_many({})
        if docs:
            await db.jobs.insert_many(docs)

        await db.jobs_meta.update_one(
            {"_id": "state"},
            {"$set": {
                "last_refreshed_at": datetime.now(timezone.utc).isoformat(),
                "count": len(docs),
                "provider": _jobs_provider.provider_name,
            }},
            upsert=True,
        )
        return len(docs)


async def _safe_refresh_jobs():
    try:
        await _refresh_jobs_cache()
    except Exception:
        logger.exception("jobs refresh failed")


def _schedule_jobs_refresh():
    """Fire-and-forget refresh; never block the request path."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_safe_refresh_jobs())
    except RuntimeError:
        logger.warning("jobs refresh skipped — no running event loop")


async def _ensure_fresh_jobs():
    """Serve cache immediately; refresh in background when empty/stale."""
    meta = await db.jobs_meta.find_one({"_id": "state"}, {"_id": 0})
    count = await db.jobs.count_documents({})
    stale = True
    if meta and meta.get("last_refreshed_at"):
        try:
            last = datetime.fromisoformat(meta["last_refreshed_at"])
            if last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            stale = datetime.now(timezone.utc) - last >= timedelta(hours=JOB_CACHE_TTL_HOURS)
        except Exception:
            stale = True
    if count == 0 or stale:
        if not _jobs_refresh_lock.locked():
            _schedule_jobs_refresh()


@api_router.get("/jobs")
async def list_jobs():
    await _ensure_fresh_jobs()
    items = await db.jobs.find({}, {"_id": 0}).to_list(500)
    meta = await db.jobs_meta.find_one({"_id": "state"}, {"_id": 0}) or {}
    return {
        "jobs": items,
        "count": len(items),
        "last_refreshed_at": meta.get("last_refreshed_at"),
        "provider": meta.get("provider"),
    }


@api_router.post("/jobs/refresh")
async def refresh_jobs(request: Request):
    """Admin-only: force refresh regardless of TTL."""
    await require_admin(request)
    # Wipe last_refreshed_at to force refresh
    await db.jobs_meta.update_one({"_id": "state"}, {"$set": {"last_refreshed_at": None}}, upsert=True)
    count = await _refresh_jobs_cache()
    return {"ok": True, "count": count}


class InsightsRequest(BaseModel):
    provider: str
    provider_job_id: str


@api_router.post("/jobs/insights")
async def job_insights(payload: InsightsRequest, request: Request):
    enforce_rate_limit(request, key="insights", limit=20, window_sec=60)
    """Return AI-generated company insights for a specific cached job."""
    job = await db.jobs.find_one(
        {"provider": payload.provider, "provider_job_id": payload.provider_job_id},
        {"_id": 0},
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found in cache")

    company = job.get("company") or ""
    title = job.get("title") or ""
    location = job.get("location") or ""

    # Prefer salary from the original SerpAPI extension if present
    salary_hint = job.get("salary")

    result = await get_company_insights(
        db, company=company, title=title, location=location, salary_hint=salary_hint,
    )
    return {
        "company": company,
        "title": title,
        **result,
    }


# ---------- Career GPS ----------

class CareerGPSAnswers(BaseModel):
    profile: dict = Field(default_factory=dict)
    interests: List[str] = Field(default_factory=list)
    styles: List[str] = Field(default_factory=list)
    skills: dict = Field(default_factory=dict)
    goals: dict = Field(default_factory=dict)


@api_router.post("/career-gps/assess")
async def career_gps_endpoint(payload: CareerGPSAnswers, request: Request):
    result = career_gps_assess(payload.model_dump())
    # Persist assessment if user is signed in (optional)
    user = await get_current_user(request)
    doc = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "user_id": user.get("user_id") if user else None,
        "email": user.get("email") if user else None,
        "answers": payload.model_dump(),
        "result": result,
    }
    await db.career_gps_assessments.insert_one(doc)
    return {"assessment_id": doc["id"], **result}


class CareerGPSRoadmapRequest(BaseModel):
    role: str
    answers: CareerGPSAnswers


@api_router.post("/career-gps/roadmap")
async def career_gps_roadmap(payload: CareerGPSRoadmapRequest):
    data = await generate_personalized_roadmap(db, payload.role, payload.answers.model_dump())
    return data


@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    now = datetime.now(timezone.utc)
    today_cutoff = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_cutoff = (now - timedelta(days=7)).isoformat()

    webinar_total = await db.webinar_registrations.count_documents({})
    webinar_today = await db.webinar_registrations.count_documents({"created_at": {"$gte": today_cutoff}})
    webinar_week = await db.webinar_registrations.count_documents({"created_at": {"$gte": week_cutoff}})

    mentorship_total = await db.mentorship_requests.count_documents({})
    mentorship_today = await db.mentorship_requests.count_documents({"created_at": {"$gte": today_cutoff}})
    mentorship_week = await db.mentorship_requests.count_documents({"created_at": {"$gte": week_cutoff}})

    waitlist_total = await db.waitlist_signups.count_documents({})
    waitlist_today = await db.waitlist_signups.count_documents({"created_at": {"$gte": today_cutoff}})
    waitlist_week = await db.waitlist_signups.count_documents({"created_at": {"$gte": week_cutoff}})

    users_total = await db.users.count_documents({})

    # Top UTM sources (waitlist + webinar)
    pipeline = [
        {"$match": {"utm_source": {"$ne": None, "$exists": True}}},
        {"$group": {"_id": "$utm_source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_utm_raw = await db.waitlist_signups.aggregate(pipeline).to_list(5)
    if not top_utm_raw:
        top_utm_raw = await db.webinar_registrations.aggregate(pipeline).to_list(5)
    top_utm = [{"source": x["_id"], "count": x["count"]} for x in top_utm_raw]

    return {
        "webinar": {"total": webinar_total, "today": webinar_today, "last_7_days": webinar_week},
        "mentorship": {"total": mentorship_total, "today": mentorship_today, "last_7_days": mentorship_week},
        "waitlist": {"total": waitlist_total, "today": waitlist_today, "last_7_days": waitlist_week},
        "users_total": users_total,
        "top_utm_sources": top_utm,
    }

app.include_router(api_router)

def _cors_origins():
    raw = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    if not raw:
        # Safe local default — never pair '*' with credentials
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    if "*" in raw:
        logger.warning("CORS_ORIGINS includes *; disabling credentials")
        return ["*"]
    return raw


_CORS_ORIGINS = _cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_credentials="*" not in _CORS_ORIGINS,
    allow_origins=_CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def ensure_indexes():
    specs = [
        (db.waitlist_signups, [("email", 1)], {"unique": True}),
        (db.waitlist_signups, [("created_at", -1)], {}),
        (db.user_sessions, [("session_token_hash", 1)], {"unique": True, "sparse": True}),
        (db.user_sessions, [("expires_at", 1)], {}),
        (db.users, [("email", 1)], {"unique": True}),
        (db.users, [("user_id", 1)], {"unique": True}),
        (db.webinar_registrations, [("created_at", -1)], {}),
        (db.mentorship_requests, [("created_at", -1)], {}),
    ]
    for coll, keys, opts in specs:
        try:
            await coll.create_index(keys, **opts)
        except Exception:
            logger.warning("Index create failed on %s %s", coll.name, keys, exc_info=True)
    logger.info("Mongo index ensure complete")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
