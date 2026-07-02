from pydantic import BaseModel, Field


class WindyPointForecastRequest(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)
    model: str = "gfs"
    parameters: list[str] | None = None


class WindyPointForecastResponse(BaseModel):
    source: str = "Windy Point Forecast"
    data: dict
