"""Central env/config for PrepAlign backend.

Secrets must come from environment variables (or backend/.env via load_dotenv).
Never hardcode API keys.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional


def _env(name: str, default: str = "") -> str:
    return (os.environ.get(name) or default).strip()


@dataclass(frozen=True)
class OpenRouterConfig:
    api_key: str
    insights_model: str
    roadmap_model: str
    base_url: str = "https://openrouter.ai/api/v1/chat/completions"
    http_referer: str = "https://prepalign.app"
    app_title: str = "PrepAlign"

    @property
    def configured(self) -> bool:
        return bool(self.api_key)


@dataclass(frozen=True)
class SerpApiConfig:
    api_key: str
    country: str = "in"
    location: str = "India"

    @property
    def configured(self) -> bool:
        return bool(self.api_key)


def get_openrouter() -> OpenRouterConfig:
    return OpenRouterConfig(
        api_key=_env("OPENROUTER_API_KEY"),
        insights_model=_env(
            "OPENROUTER_INSIGHTS_MODEL",
            "nvidia/nemotron-3-ultra-550b-a55b:free",
        ),
        roadmap_model=_env("OPENROUTER_ROADMAP_MODEL", "openai/gpt-4o-mini"),
    )


def get_serpapi() -> SerpApiConfig:
    return SerpApiConfig(api_key=_env("SERPAPI_KEY"))


def integration_status() -> dict:
    """Safe status flags only — never include secret values."""
    return {
        "openrouter": get_openrouter().configured,
        "serpapi": get_serpapi().configured,
        "mongo": bool(_env("MONGO_URL")),
        "db_name": bool(_env("DB_NAME")),
    }


def openrouter_headers(title_suffix: Optional[str] = None) -> dict:
    cfg = get_openrouter()
    title = cfg.app_title if not title_suffix else f"{cfg.app_title} {title_suffix}"
    return {
        "Authorization": f"Bearer {cfg.api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": cfg.http_referer,
        "X-Title": title,
    }
