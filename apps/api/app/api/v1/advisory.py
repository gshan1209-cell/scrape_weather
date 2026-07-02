from fastapi import APIRouter, Query

from app.schemas.advisory import WeeklyAdvisoryResponse
from app.services.advisory_service import AdvisoryService
from app.services.weather_service import WeatherService


router = APIRouter()
weather_service = WeatherService()
advisory_service = AdvisoryService()


@router.get("/weekly", response_model=WeeklyAdvisoryResponse)
async def weekly_advisory(
    city: str = Query(..., min_length=1),
    district: str | None = Query(default=None),
    crop: str | None = Query(default=None),
) -> WeeklyAdvisoryResponse:
    weather = await weather_service.get_weekly_weather(city=city, district=district)
    advisory = advisory_service.generate(days=[day.model_dump() for day in weather.days], crop=crop)
    return WeeklyAdvisoryResponse(city=city, district=district, crop=crop, **advisory)
