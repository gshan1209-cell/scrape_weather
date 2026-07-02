import httpx

from app.core.config import settings


class CwaClient:
    BASE_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore"

    async def fetch_weekly_forecast(self, dataset_id: str, location_name: str | None = None) -> dict:
        if not settings.CWA_API_KEY:
            raise ValueError("CWA_API_KEY is not configured")

        params = {"Authorization": settings.CWA_API_KEY, "format": "JSON"}
        if location_name:
            params["locationName"] = location_name

        async with httpx.AsyncClient(timeout=20, verify=settings.CWA_VERIFY_SSL) as client:
            response = await client.get(f"{self.BASE_URL}/{dataset_id}", params=params)
            response.raise_for_status()
            return response.json()

    async def fetch_stations(self) -> dict:
        if not settings.CWA_API_KEY:
            raise ValueError("CWA_API_KEY is not configured")

        params = {"Authorization": settings.CWA_API_KEY, "format": "JSON"}

        async with httpx.AsyncClient(timeout=30, verify=settings.CWA_VERIFY_SSL) as client:
            response = await client.get(f"{self.BASE_URL}/O-A0001-001", params=params)
            response.raise_for_status()
            return response.json()
