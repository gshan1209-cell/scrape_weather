from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.config import settings
from app.schemas.weather import DailyWeather, WeeklyWeatherResponse
from app.services.cwa_client import CwaClient


TAIPEI_TZ = timezone(timedelta(hours=8))


class WeatherService:
    def __init__(self, cwa_client: CwaClient | None = None) -> None:
        self.cwa_client = cwa_client or CwaClient()

    async def get_weekly_weather(self, city: str, district: str | None = None) -> WeeklyWeatherResponse:
        try:
            raw = await self.cwa_client.fetch_weekly_forecast(settings.CWA_WEEKLY_DATASET_ID, city)
            return self._normalize_cwa(raw, city=city, district=district)
        except Exception:
            return self._mock_weather(city=city, district=district)

    def _normalize_cwa(self, raw: dict[str, Any], city: str, district: str | None) -> WeeklyWeatherResponse:
        records = raw.get("records", {})
        locations = records.get("locations") or []
        location_items = []
        for group in locations:
            location_items.extend(group.get("location", []))
        if not location_items:
            location_items = records.get("location", [])

        target = self._pick_location(location_items, district or city)
        weather_elements = target.get("weatherElement", []) if target else []
        days = self._days_from_elements(weather_elements)
        if not days:
            return self._mock_weather(city=city, district=district)

        updated_at = raw.get("sent") or datetime.now(TAIPEI_TZ).isoformat()
        return WeeklyWeatherResponse(
            city=city,
            district=district,
            updatedAt=updated_at,
            source="CWA OpenData",
            days=days[:7],
        )

    def _pick_location(self, locations: list[dict[str, Any]], name: str) -> dict[str, Any] | None:
        for location in locations:
            if location.get("locationName") == name:
                return location
        return locations[0] if locations else None

    def _days_from_elements(self, elements: list[dict[str, Any]]) -> list[DailyWeather]:
        by_date: dict[str, dict[str, Any]] = {}
        for element in elements:
            name = element.get("elementName") or element.get("description") or ""
            for item in element.get("time", []):
                start = item.get("startTime") or item.get("dataTime")
                if not start:
                    continue
                date = start[:10]
                bucket = by_date.setdefault(date, {"date": date, "weather": "Weather data available"})
                bucket["rawTimeRange"] = self._time_range(item)
                value = self._extract_value(item)
                self._apply_element(bucket, name, value)

        return [DailyWeather(**day) for _, day in sorted(by_date.items())]

    def _extract_value(self, item: dict[str, Any]) -> str | None:
        values = item.get("elementValue") or []
        if isinstance(values, list) and values:
            first = values[0]
            return first.get("value") or first.get("measures")
        return item.get("parameter", {}).get("parameterName")

    def _time_range(self, item: dict[str, Any]) -> str | None:
        start = item.get("startTime") or item.get("dataTime")
        end = item.get("endTime")
        return f"{start}/{end}" if start and end else start

    def _apply_element(self, bucket: dict[str, Any], name: str, value: str | None) -> None:
        lowered = name.lower()
        number = self._to_int(value)
        if name in {"Wx"} or "weather" in lowered or "天氣" in name:
            bucket["weather"] = value or bucket["weather"]
        elif name in {"MaxT", "Tmax"} or "max" in lowered or "最高" in name:
            bucket["maxTemp"] = number
        elif name in {"MinT", "Tmin"} or "min" in lowered or "最低" in name:
            bucket["minTemp"] = number
        elif name in {"PoP", "PoP12h", "PoP6h"} or "rain" in lowered or "降雨" in name:
            bucket["rainProbability"] = number
        elif name in {"CI"} or "comfort" in lowered or "舒適" in name:
            bucket["comfort"] = value
        elif "uv" in lowered or "紫外" in name:
            bucket["uvIndex"] = number
        elif "wind" in lowered or "風" in name:
            bucket["windDescription"] = value

    def _to_int(self, value: str | None) -> int | None:
        if value is None:
            return None
        digits = "".join(ch for ch in str(value) if ch.isdigit())
        return int(digits) if digits else None

    def _mock_weather(self, city: str, district: str | None) -> WeeklyWeatherResponse:
        today = datetime.now(TAIPEI_TZ)
        patterns = [
            ("Hot with afternoon thunderstorms", 26, 36, 70, 8),
            ("Cloudy and humid", 25, 33, 45, 6),
            ("Showers likely", 24, 31, 75, 4),
            ("Partly sunny", 25, 34, 30, 7),
            ("Warm with scattered rain", 26, 35, 60, 8),
            ("Cloudy", 24, 32, 40, 5),
            ("Sunny and hot", 26, 36, 20, 9),
        ]
        days = []
        for offset, (weather, min_temp, max_temp, rain, uv) in enumerate(patterns):
            day = today + timedelta(days=offset)
            days.append(
                DailyWeather(
                    date=day.date().isoformat(),
                    weather=weather,
                    minTemp=min_temp,
                    maxTemp=max_temp,
                    rainProbability=rain,
                    comfort="Humid",
                    uvIndex=uv,
                    windDescription="Light to moderate breeze",
                    rawTimeRange=f"{day.date().isoformat()}T06:00:00+08:00/{day.date().isoformat()}T18:00:00+08:00",
                )
            )
        return WeeklyWeatherResponse(
            city=city,
            district=district,
            updatedAt=today.isoformat(),
            source="Mock Weather Data",
            days=days,
        )
