"""Base interface for job providers.

Add new providers (Wellfound, Greenhouse, Lever, Ashby, YC Jobs, etc.) by
subclassing JobProvider and returning normalized job dicts. The rest of the
backend (repository, cache, API) and the entire frontend are provider-agnostic.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any


class JobProvider(ABC):
    provider_name: str = ""

    @abstractmethod
    async def fetch_jobs(self, queries: List[str]) -> List[Dict[str, Any]]:
        """Fetch and return normalized jobs for the given search queries.

        Each returned dict must include:
          provider, provider_job_id, title, company, logo_url, location,
          employment_type, posted_at (ISO 8601 UTC string), posted_at_raw,
          apply_link, queries (list[str]), is_remote (bool), is_internship (bool)
        """
        raise NotImplementedError
