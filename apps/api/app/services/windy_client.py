import httpx

from app.core.config import settings


class WindyPointForecastClient:
    BASE_URL = "https://api.windy.com/api/point-forecast/v2"

    async def fetch_point_forecast(
        self,
        lat: float,
        lon: float,
        model: str = "gfs",
        parameters: list[str] | None = None,
    ) -> dict:
        if not settings.ENABLE_WINDY_POINT_FORECAST:
            raise RuntimeError("Windy Point Forecast is disabled")
        if not settings.WINDY_POINT_FORECAST_API_KEY:
            raise RuntimeError("WINDY_POINT_FORECAST_API_KEY is not configured")

        payload = {
            "lat": lat,
            "lon": lon,
            "model": model,
            "parameters": parameters or ["wind", "temp", "rh", "pressure"],
            "levels": ["surface"],
            "key": settings.WINDY_POINT_FORECAST_API_KEY,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(self.BASE_URL, json=payload)
            response.raise_for_status()
            return response.json()
