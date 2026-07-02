from pydantic import BaseModel


class DailyWeather(BaseModel):
    date: str
    weather: str
    minTemp: int | None = None
    maxTemp: int | None = None
    rainProbability: int | None = None
    comfort: str | None = None
    uvIndex: int | None = None
    windDescription: str | None = None
    rawTimeRange: str | None = None


class WeeklyWeatherResponse(BaseModel):
    city: str
    district: str | None = None
    updatedAt: str
    source: str = "CWA OpenData"
    days: list[DailyWeather]
