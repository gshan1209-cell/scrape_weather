from fastapi import APIRouter

from app.repositories.location_repository import LocationRepository
from app.schemas.location import LocationListResponse


router = APIRouter()
repository = LocationRepository()


@router.get("/locations", response_model=LocationListResponse)
async def list_locations() -> LocationListResponse:
    return LocationListResponse(locations=repository.list_locations())
