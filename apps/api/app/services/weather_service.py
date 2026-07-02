from datetime import datetime, timedelta, timezone
from typing import Any

from app.core.config import settings
from app.schemas.weather import DailyWeather, StationsResponse, WeatherStation, WeeklyWeatherResponse
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

    async def get_stations(self) -> StationsResponse:
        try:
            raw = await self.cwa_client.fetch_stations()
            return self._normalize_stations(raw)
        except Exception:
            return StationsResponse(updatedAt=datetime.now(TAIPEI_TZ).isoformat(), stations=[])

    def _normalize_stations(self, raw: dict[str, Any]) -> StationsResponse:
        records = raw.get("records", {})
        station_list = records.get("Station") or records.get("station") or []
        stations: list[WeatherStation] = []
        for entry in station_list:
            geo = entry.get("GeoInfo", {})
            coords = geo.get("Coordinates", [None]) or [None]
            coord = coords[0] if coords else {}
            lat = coord.get("StationLatitude") or coord.get("CoordinateLatitude")
            lon = coord.get("StationLongitude") or coord.get("CoordinateLongitude")
            if not lat or not lon:
                continue

            weather_elements = entry.get("WeatherElement", {})
            now_info = weather_elements.get("Now", {}) if isinstance(weather_elements.get("Now"), dict) else {}
            precip = now_info.get("Precipitation") if isinstance(now_info, dict) else None

            obs_time = entry.get("ObsTime", {})
            obs_datetime = obs_time.get("DateTime") if isinstance(obs_time, dict) else None

            stations.append(WeatherStation(
                stationId=entry.get("StationId", ""),
                stationName=entry.get("StationName", ""),
                countyName=geo.get("CountyName", ""),
                townName=geo.get("TownName", ""),
                lat=float(lat),
                lon=float(lon),
                altitude=self._to_float(geo.get("StationAltitude")),
                obsTime=obs_datetime,
                airTemperature=self._to_float(weather_elements.get("AirTemperature")),
                precipitation=self._to_float(precip),
                windSpeed=self._to_float(weather_elements.get("WindSpeed")),
                windDirection=self._to_float(weather_elements.get("WindDirection")),
                relativeHumidity=self._to_int(weather_elements.get("RelativeHumidity")),
                airPressure=self._to_float(weather_elements.get("AirPressure")),
                weather=weather_elements.get("Weather"),
            ))

        return StationsResponse(
            updatedAt=datetime.now(TAIPEI_TZ).isoformat(),
            stations=stations,
        )

    def _to_float(self, value: Any) -> float | None:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    def _normalize_cwa(self, raw: dict[str, Any], city: str, district: str | None) -> WeeklyWeatherResponse:
        records = raw.get("records", {})
        locations = records.get("locations") or records.get("Locations") or []
        location_items = []
        for group in locations:
            location_items.extend(group.get("location", []) or group.get("Location", []))
        if not location_items:
            location_items = records.get("location", []) or records.get("Location", [])

        target = self._pick_location(location_items, city)
        weather_elements = (target.get("weatherElement", []) or target.get("WeatherElement", [])) if target else []
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
            if (location.get("locationName") or location.get("LocationName")) == name:
                return location
        return locations[0] if locations else None

    def _days_from_elements(self, elements: list[dict[str, Any]]) -> list[DailyWeather]:
        by_date: dict[str, dict[str, Any]] = {}
        for element in elements:
            name = element.get("elementName") or element.get("ElementName") or element.get("description") or ""
            for item in element.get("time", []) or element.get("Time", []):
                start = item.get("startTime") or item.get("StartTime") or item.get("dataTime") or item.get("DataTime")
                if not start:
                    continue
                date = start[:10]
                bucket = by_date.setdefault(date, {"date": date, "weather": "已有天氣資料"})
                bucket["rawTimeRange"] = self._time_range(item)
                value = self._extract_value(item)
                self._apply_element(bucket, name, value)

        return [DailyWeather(**day) for _, day in sorted(by_date.items())]

    def _extract_value(self, item: dict[str, Any]) -> str | None:
        values = item.get("elementValue") or item.get("ElementValue") or []
        if isinstance(values, list) and values:
            first = values[0]
            preferred_keys = [
                "value",
                "measures",
                "WeatherDescription",
                "Weather",
                "MaxTemperature",
                "MinTemperature",
                "Temperature",
                "ProbabilityOfPrecipitation",
                "MinComfortIndexDescription",
                "MaxComfortIndexDescription",
                "UVIndex",
                "WindSpeed",
                "WindDirection",
            ]
            for key in preferred_keys:
                if first.get(key) is not None:
                    return str(first[key])
            if first:
                return str(next(iter(first.values())))
        return item.get("parameter", {}).get("parameterName")

    def _time_range(self, item: dict[str, Any]) -> str | None:
        start = item.get("startTime") or item.get("StartTime") or item.get("dataTime") or item.get("DataTime")
        end = item.get("endTime") or item.get("EndTime")
        return f"{start}/{end}" if start and end else start

    def _apply_element(self, bucket: dict[str, Any], name: str, value: str | None) -> None:
        lowered = name.lower()
        number = self._to_int(value)
        if name in {"Wx"} or "weather" in lowered or name == "天氣現象":
            bucket["weather"] = value or bucket["weather"]
        elif name in {"MaxT", "Tmax"} or "max" in lowered or name == "最高溫度":
            bucket["maxTemp"] = number
        elif name in {"MinT", "Tmin"} or "min" in lowered or name == "最低溫度":
            bucket["minTemp"] = number
        elif name in {"PoP", "PoP12h", "PoP6h"} or "rain" in lowered or "降雨" in name:
            bucket["rainProbability"] = number
        elif name in {"CI"} or "comfort" in lowered or "舒適" in name:
            bucket["comfort"] = value
        elif "uv" in lowered or "紫外" in name:
            bucket["uvIndex"] = number
        elif "wind" in lowered or "風" in name:
            bucket["windDescription"] = value
        elif name == "天氣預報綜合描述" and bucket.get("weather") in {None, "已有天氣資料"}:
            bucket["weather"] = value or bucket["weather"]

    def _to_int(self, value: str | None) -> int | None:
        if value is None:
            return None
        digits = "".join(ch for ch in str(value) if ch.isdigit())
        return int(digits) if digits else None

    def _mock_weather(self, city: str, district: str | None) -> WeeklyWeatherResponse:
        today = datetime.now(TAIPEI_TZ)
        patterns = [
            ("高溫炎熱，午後有雷陣雨", 26, 36, 70, 8),
            ("多雲悶熱", 25, 33, 45, 6),
            ("短暫陣雨機率高", 24, 31, 75, 4),
            ("晴時多雲", 25, 34, 30, 7),
            ("溫暖，局部短暫雨", 26, 35, 60, 8),
            ("多雲", 24, 32, 40, 5),
            ("晴朗炎熱", 26, 36, 20, 9),
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
                    comfort="悶熱",
                    uvIndex=uv,
                    windDescription="微風至和緩風",
                    rawTimeRange=f"{day.date().isoformat()}T06:00:00+08:00/{day.date().isoformat()}T18:00:00+08:00",
                )
            )
        return WeeklyWeatherResponse(
            city=city,
            district=district,
            updatedAt=today.isoformat(),
            source="模擬天氣資料",
            days=days,
        )
