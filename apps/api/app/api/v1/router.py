from fastapi import APIRouter

from app.api.v1 import advisory, health, locations, weather


api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(locations.router, tags=["locations"])
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])
api_router.include_router(advisory.router, prefix="/advisory", tags=["advisory"])
