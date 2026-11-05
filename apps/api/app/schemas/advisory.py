from pydantic import BaseModel
from app.schemas.weather import DataStatus


class AdvisoryAlert(BaseModel):
    level: str
    type: str
    title: str
    message: str


class WeeklyAdvisoryResponse(BaseModel):
    city: str
    district: str | None = None
    crop: str | None = None
    source: str | None = None
    dataStatus: DataStatus = "unknown"
    reason: str | None = None
    summary: str
    riskLevel: str
    alerts: list[AdvisoryAlert]
    suggestions: list[str]
