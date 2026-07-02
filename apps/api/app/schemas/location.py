from pydantic import BaseModel


class LocationItem(BaseModel):
    city: str
    districts: list[str]


class LocationListResponse(BaseModel):
    locations: list[LocationItem]
