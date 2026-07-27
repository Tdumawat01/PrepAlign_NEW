"""Lightweight in-process rate limiting (no extra dependencies).

Suitable for single-process / low-traffic API. For multi-instance production,
move limits to Redis or the edge (Cloudflare / nginx).
"""
from __future__ import annotations

import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request

_lock = threading.Lock()
_buckets: Dict[str, Deque[float]] = defaultdict(deque)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") or request.headers.get("x-real-ip")
    if forwarded:
        return forwarded.split(",")[0].strip()[:64]
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def enforce_rate_limit(
    request: Request,
    *,
    key: str,
    limit: int = 12,
    window_sec: int = 60,
) -> None:
    """Raise 429 when `limit` hits are exceeded within `window_sec` for key+IP."""
    ip = client_ip(request)
    bucket_key = f"{key}:{ip}"
    now = time.monotonic()
    with _lock:
        q = _buckets[bucket_key]
        while q and now - q[0] > window_sec:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait a minute and try again.",
            )
        q.append(now)
