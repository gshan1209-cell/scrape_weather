from datetime import datetime, timedelta, timezone
import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.api.v1 import advisory
from app.core.config import settings
from app.main import app
from app.schemas.weather import WeeklyWeatherResponse
from app.services.weather_service import WeatherService

TZ = timezone(timedelta(hours=8))


def forecast(city="臺北市", *, sent=None, date=None):
    now = datetime.now(TZ)
    return {
        **({"sent": sent} if sent is not None else {}),
        "records": {"Locations": [{"Location": [{
            "LocationName": city,
            "WeatherElement": [{"ElementName": "MaxT", "Time": [{
                "StartTime": f"{date or now.date().isoformat()}T06:00:00+08:00",
                "EndTime": f"{date or now.date().isoformat()}T18:00:00+08:00",
                "ElementValue": [{"value": "28"}],
            }]}],
        }]}]},
    }


def test_missing_city_never_uses_another_city_forecast():
    result = WeatherService()._normalize_cwa(forecast("臺南市"), "臺北市", "北投區")
    assert result.days == []
    assert result.model_dump()["dataStatus"] == "empty"
    assert result.model_dump()["reason"] == "location_not_found"


def test_missing_publication_time_is_not_replaced_with_now():
    result = WeatherService()._normalize_cwa(forecast(), "臺北市", None)
    assert result.updatedAt is None
    assert result.model_dump()["dataStatus"] == "unknown"


def test_expired_forecast_is_explicitly_stale():
    result = WeatherService()._normalize_cwa(
        forecast(sent="2001-01-01T00:00:00+08:00", date="2001-01-01"), "臺北市", None,
    )
    assert result.model_dump().get("dataStatus") == "stale"
    assert result.updatedAt == "2001-01-01T00:00:00+08:00"


def test_future_publication_time_is_not_trusted_as_current():
    sent = (datetime.now(TZ) + timedelta(days=3)).isoformat()
    result = WeatherService()._normalize_cwa(forecast(sent=sent), "臺北市", None)
    assert result.model_dump().get("dataStatus") == "unknown"


def test_current_matching_forecast_preserves_official_source_and_time():
    sent = datetime.now(TZ).isoformat()
    result = WeatherService()._normalize_cwa(forecast(sent=sent), "臺北市", "北投區")
    assert result.source == "CWA OpenData"
    assert result.city == "臺北市"
    assert result.updatedAt == sent
    assert result.model_dump().get("dataStatus") == "live"


def test_recent_publication_excludes_expired_days_from_forecast_and_advice():
    now = datetime.now(TZ)
    raw = forecast(sent=now.isoformat())
    element = raw["records"]["Locations"][0]["Location"][0]["WeatherElement"][0]
    yesterday = (now - timedelta(days=1)).date().isoformat()
    element["Time"].insert(0, {"StartTime": f"{yesterday}T06:00:00+08:00", "ElementValue": [{"value": "40"}]})
    result = WeatherService()._normalize_cwa(raw, "臺北市", None)
    assert [day.date for day in result.days] == [now.date().isoformat()]


class FailedProvider:
    async def fetch_weekly_forecast(self, *args):
        raise httpx.ConnectError("CERTIFICATE_VERIFY_FAILED synthetic-secret-marker")

    async def fetch_stations(self):
        raise httpx.ConnectError("CERTIFICATE_VERIFY_FAILED synthetic-secret-marker")


@pytest.mark.asyncio
async def test_station_tls_failure_has_sanitized_reason_and_no_observation_time(monkeypatch):
    monkeypatch.setattr(settings, "CWA_API_KEY", "synthetic-noncredential")
    result = await WeatherService(FailedProvider()).get_stations()
    data = result.model_dump()
    assert data.get("dataStatus") == "error"
    assert data.get("reason") == "upstream_tls_error"
    assert result.updatedAt is None
    assert result.stations == []
    assert "synthetic-secret-marker" not in json.dumps(data)


@pytest.mark.asyncio
async def test_missing_key_is_distinct_from_empty_live_stations(monkeypatch):
    monkeypatch.setattr(settings, "CWA_API_KEY", None)
    data = (await WeatherService().get_stations()).model_dump()
    assert data.get("dataStatus") == "unavailable"
    assert data.get("reason") == "not_configured"
    assert data["updatedAt"] is None


def test_empty_station_dataset_has_no_fabricated_observation_timestamp():
    data = WeatherService()._normalize_stations({"records": {"Station": []}}).model_dump()
    assert data.get("dataStatus") == "empty"
    assert data.get("reason") == "empty_dataset"
    assert data["updatedAt"] is None


def test_station_freshness_uses_observation_time():
    observed = "2001-01-01T00:00:00+08:00"
    raw = {"records": {"Station": [{
        "StationId": "SYNTHETIC", "StationName": "Synthetic station",
        "ObsTime": {"DateTime": observed},
        "GeoInfo": {"Coordinates": [{"StationLatitude": "25", "StationLongitude": "121"}]},
    }]}}
    result = WeatherService()._normalize_stations(raw)
    assert result.updatedAt == observed
    assert result.model_dump().get("dataStatus") == "stale"


@pytest.mark.asyncio
async def test_weekly_tls_fallback_is_explicitly_mock_with_a_reason(monkeypatch):
    monkeypatch.setattr(settings, "CWA_API_KEY", "synthetic-noncredential")
    result = await WeatherService(FailedProvider()).get_weekly_weather("臺北市", "北投區")
    data = result.model_dump()
    assert result.source == "模擬天氣資料"
    assert data.get("dataStatus") == "mock"
    assert data.get("reason") == "upstream_tls_error"
    assert "synthetic-secret-marker" not in json.dumps(data)


def test_stale_forecast_cannot_produce_normal_farming_advice(monkeypatch):
    class StaleProvider:
        async def get_weekly_weather(self, **kwargs):
            return WeeklyWeatherResponse(
                city="臺北市", district="北投區", updatedAt="2001-01-01T00:00:00+08:00",
                source="CWA OpenData", dataStatus="stale", reason="data_expired",
                days=[{"date": "2001-01-01", "weather": "Synthetic", "maxTemp": 28}],
            )
    monkeypatch.setattr(advisory, "weather_service", StaleProvider())
    response = TestClient(app).get("/api/v1/advisory/weekly", params={"city": "臺北市", "district": "北投區"})
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "info"
    assert data["suggestions"] == []
    assert data.get("dataStatus") == "stale"
