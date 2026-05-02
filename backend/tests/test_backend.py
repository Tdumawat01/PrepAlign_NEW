"""Backend API tests for PrepAlign landing site (including Admin dashboard endpoints)."""
import os
import uuid
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # fallback to frontend env file
    try:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
                    break
    except Exception:
        pass

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')
# Admin email configured in /app/backend/.env
ADMIN_EMAIL = "tanishdumawat01@gmail.com"


@pytest.fixture(scope="session")
def mongo_db():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _seed_user_session(mongo_db, email: str):
    user_id = f"test-user-{uuid.uuid4().hex[:8]}"
    session_token = f"test_session_{uuid.uuid4().hex}"
    mongo_db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": f"Test {email}",
        "picture": "https://via.placeholder.com/150",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    return {"user_id": user_id, "session_token": session_token, "email": email}


@pytest.fixture(scope="session")
def seeded_session(mongo_db):
    """Seed a non-admin user + session for /auth/me and logout tests."""
    email = f"TEST_{uuid.uuid4().hex[:6]}@example.com"
    s = _seed_user_session(mongo_db, email)
    yield s
    mongo_db.users.delete_one({"user_id": s["user_id"]})
    mongo_db.user_sessions.delete_many({"session_token": s["session_token"]})


@pytest.fixture(scope="session")
def admin_session(mongo_db):
    """Seed an admin user + session (email matches ADMIN_EMAILS env)."""
    # If admin user already exists (e.g. from real OAuth), reuse user_id
    existing = mongo_db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        user_id = existing["user_id"]
        created_user = False
    else:
        user_id = f"test-admin-{uuid.uuid4().hex[:8]}"
        mongo_db.users.insert_one({
            "user_id": user_id,
            "email": ADMIN_EMAIL,
            "name": "Admin User",
            "picture": "https://via.placeholder.com/150",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        created_user = True
    session_token = f"test_admin_session_{uuid.uuid4().hex}"
    mongo_db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    yield {"user_id": user_id, "session_token": session_token, "email": ADMIN_EMAIL}
    mongo_db.user_sessions.delete_many({"session_token": session_token})
    if created_user:
        mongo_db.users.delete_one({"user_id": user_id})


@pytest.fixture(scope="session")
def non_admin_session(mongo_db):
    """Seed a regular (non-admin) user + session."""
    email = f"TEST_nonadmin_{uuid.uuid4().hex[:6]}@example.com"
    s = _seed_user_session(mongo_db, email)
    yield s
    mongo_db.users.delete_one({"user_id": s["user_id"]})
    mongo_db.user_sessions.delete_many({"session_token": s["session_token"]})


# --------------- Root ---------------

def test_root(api_client):
    r = api_client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data
    assert isinstance(data["message"], str)


# --------------- Webinar ---------------

class TestWebinar:
    created_ids = []

    def test_register_valid(self, api_client, mongo_db):
        payload = {
            "full_name": "TEST_Aman Kumar",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "9876543210",
            "college": "TEST College",
            "interested_role": "AI Product Manager",
            "utm_source": "TEST_google",
        }
        r = api_client.post(f"{BASE_URL}/api/webinar/register", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data and isinstance(data["id"], str)
        TestWebinar.created_ids.append(data["id"])

        # Persistence check
        doc = mongo_db.webinar_registrations.find_one({"id": data["id"]})
        assert doc is not None
        assert doc["email"] == payload["email"]

    def test_register_invalid_email(self, api_client):
        payload = {
            "full_name": "TEST X",
            "email": "not-an-email",
            "phone": "9876543210",
            "college": "TEST College",
            "interested_role": "AI",
        }
        r = api_client.post(f"{BASE_URL}/api/webinar/register", json=payload)
        assert r.status_code == 422

    def test_register_missing_field(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/webinar/register", json={"email": "a@b.com"})
        assert r.status_code == 422

    def test_list_registrations_unauthenticated_401(self):
        r = requests.get(f"{BASE_URL}/api/webinar/registrations")
        assert r.status_code == 401

    def test_list_registrations_non_admin_403(self, non_admin_session):
        r = requests.get(
            f"{BASE_URL}/api/webinar/registrations",
            headers={"Authorization": f"Bearer {non_admin_session['session_token']}"},
        )
        assert r.status_code == 403

    def test_list_registrations_admin_200(self, admin_session):
        r = requests.get(
            f"{BASE_URL}/api/webinar/registrations",
            headers={"Authorization": f"Bearer {admin_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        for item in items:
            assert "_id" not in item
        ids = [i.get("id") for i in items]
        assert any(cid in ids for cid in TestWebinar.created_ids)

    def test_zzz_cleanup_webinar(self, mongo_db):
        if TestWebinar.created_ids:
            mongo_db.webinar_registrations.delete_many({"id": {"$in": TestWebinar.created_ids}})


# --------------- Mentorship ---------------

class TestMentorship:
    created_ids = []

    def test_request_valid(self, api_client, mongo_db):
        payload = {
            "name": "TEST Mentor Seeker",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "phone": "9876543210",
            "current_status": "Final year student",
            "target_role": "AI PM",
            "biggest_challenge": "No coding background",
            "help_needed": "Resume + Interview prep",
        }
        r = api_client.post(f"{BASE_URL}/api/mentorship/request", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data
        msg = data.get("message", "")
        assert "24-48" in msg
        assert "संपर्क" in msg or "हम" in msg
        TestMentorship.created_ids.append(data["id"])

        doc = mongo_db.mentorship_requests.find_one({"id": data["id"]})
        assert doc is not None
        assert doc["email"] == payload["email"]

    def test_request_invalid_email(self, api_client):
        payload = {
            "name": "TEST X",
            "email": "bad",
            "phone": "9876543210",
            "current_status": "x",
            "target_role": "x",
            "biggest_challenge": "x",
            "help_needed": "x",
        }
        r = api_client.post(f"{BASE_URL}/api/mentorship/request", json=payload)
        assert r.status_code == 422

    def test_list_requests_unauthenticated_401(self):
        r = requests.get(f"{BASE_URL}/api/mentorship/requests")
        assert r.status_code == 401

    def test_list_requests_non_admin_403(self, non_admin_session):
        r = requests.get(
            f"{BASE_URL}/api/mentorship/requests",
            headers={"Authorization": f"Bearer {non_admin_session['session_token']}"},
        )
        assert r.status_code == 403

    def test_list_requests_admin_200(self, admin_session):
        r = requests.get(
            f"{BASE_URL}/api/mentorship/requests",
            headers={"Authorization": f"Bearer {admin_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        for item in items:
            assert "_id" not in item

    def test_zzz_cleanup_mentorship(self, mongo_db):
        if TestMentorship.created_ids:
            mongo_db.mentorship_requests.delete_many({"id": {"$in": TestMentorship.created_ids}})


# --------------- Admin Stats ---------------

class TestAdminStats:
    def test_stats_unauthenticated_401(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401

    def test_stats_non_admin_403(self, non_admin_session):
        r = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {non_admin_session['session_token']}"},
        )
        assert r.status_code == 403

    def test_stats_admin_200(self, admin_session):
        r = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # Structure validation
        assert "webinar" in data and isinstance(data["webinar"], dict)
        assert "mentorship" in data and isinstance(data["mentorship"], dict)
        assert "users_total" in data and isinstance(data["users_total"], int)
        assert "top_utm_sources" in data and isinstance(data["top_utm_sources"], list)

        for key in ("total", "today", "last_7_days"):
            assert key in data["webinar"], f"webinar.{key} missing"
            assert isinstance(data["webinar"][key], int)
            assert key in data["mentorship"], f"mentorship.{key} missing"
            assert isinstance(data["mentorship"][key], int)

        # top_utm_sources each has source+count
        for item in data["top_utm_sources"]:
            assert "source" in item
            assert "count" in item and isinstance(item["count"], int)


# --------------- Auth ---------------

class TestAuth:
    def test_me_no_cookie(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self):
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": "Bearer invalid-token-xyz"},
        )
        assert r.status_code == 401

    def test_me_with_seeded_session(self, seeded_session):
        token = seeded_session["session_token"]
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user_id"] == seeded_session["user_id"]
        assert data["email"] == seeded_session["email"]
        assert "_id" not in data
        # Non-admin email → is_admin False
        assert data.get("is_admin") is False

    def test_me_with_cookie(self, seeded_session):
        token = seeded_session["session_token"]
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            cookies={"session_token": token},
        )
        assert r.status_code == 200
        data = r.json()
        assert data["user_id"] == seeded_session["user_id"]
        assert data.get("is_admin") is False

    def test_me_admin_is_admin_true(self, admin_session):
        r = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_session['session_token']}"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"].lower() == ADMIN_EMAIL.lower()
        assert data.get("is_admin") is True

    def test_logout_clears_session(self, mongo_db):
        user_id = f"test-user-{uuid.uuid4().hex[:8]}"
        session_token = f"test_session_{uuid.uuid4().hex}"
        email = f"TEST_{uuid.uuid4().hex[:6]}@example.com"
        mongo_db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": "Logout Test",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        mongo_db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc),
        })

        r = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {session_token}"},
        )
        assert r.status_code == 200
        assert r.json().get("ok") is True

        sess = mongo_db.user_sessions.find_one({"session_token": session_token})
        assert sess is None

        r2 = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {session_token}"},
        )
        assert r2.status_code == 401

        mongo_db.users.delete_one({"user_id": user_id})

    def test_logout_no_token(self):
        r = requests.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
