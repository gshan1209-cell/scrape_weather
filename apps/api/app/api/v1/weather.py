from fastapi import APIRouter, HTTPException, Query

from app.schemas.weather import WeeklyWeatherResponse
from app.services.weather_service import WeatherService


router = APIRouter()
service = WeatherService()


@router.get("/weekly", response_model=WeeklyWeatherResponse)
async def weekly_weather(
    city: str = Query(..., min_length=1),
    district: str | None = Query(default=None),
) -> WeeklyWeatherResponse:
    try:
        return await service.get_weekly_weather(city=city, district=district)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to fetch weather data") from exc
