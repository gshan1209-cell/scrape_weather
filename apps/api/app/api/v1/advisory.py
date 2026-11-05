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
    if not weather.days or weather.dataStatus not in {"live", "mock"}:
        message = {
            "stale": "預報資料已過期，暫不產生農事風險建議。",
            "empty": "所選城市暫無預報資料，無法產生農事風險建議。",
            "unknown": "預報時間尚未確認，暫不產生農事風險建議。",
        }.get(weather.dataStatus, "預報資料目前無法取得，暫不產生農事風險建議。")
        return WeeklyAdvisoryResponse(
            city=city, district=district, crop=crop, source=weather.source,
            dataStatus=weather.dataStatus, reason=weather.reason,
            summary=message, riskLevel="info", alerts=[], suggestions=[],
        )
    advisory = advisory_service.generate(days=[day.model_dump() for day in weather.days], crop=crop)
    return WeeklyAdvisoryResponse(
        city=city, district=district, crop=crop, source=weather.source,
        dataStatus=weather.dataStatus, reason=weather.reason, **advisory,
    )
