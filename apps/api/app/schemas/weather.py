from pydantic import BaseModel
from typing import Literal

DataStatus = Literal["live", "mock", "stale", "empty", "error", "unavailable", "unknown"]


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
    updatedAt: str | None = None
    source: str = "CWA OpenData"
    dataStatus: DataStatus = "unknown"
    reason: str | None = None
    days: list[DailyWeather]


class WeatherStation(BaseModel):
    stationId: str
    stationName: str
    countyName: str
    townName: str
    lat: float
    lon: float
    altitude: float | None = None
    obsTime: str | None = None
    airTemperature: float | None = None
    precipitation: float | None = None
    windSpeed: float | None = None
    windDirection: float | None = None
    relativeHumidity: int | None = None
    airPressure: float | None = None
    weather: str | None = None


class StationsResponse(BaseModel):
    updatedAt: str | None = None
    source: str = "CWA OpenData"
    dataStatus: DataStatus = "unknown"
    reason: str | None = None
    stations: list[WeatherStation]
