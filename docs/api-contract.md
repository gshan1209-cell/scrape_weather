# API Contract

Base URL: `/api/v1`

## Health

`GET /health`

```json
{"status":"ok","service":"weather-farmer-api","version":"1.0.0"}
```

## Locations

`GET /locations`

Returns city and district options.

## Weekly Weather

`GET /weather/weekly?city=Taipei&district=Beitou`

Returns normalized daily weather entries.

## Weekly Advisory

`GET /advisory/weekly?city=Taipei&district=Beitou&crop=rice`

Returns risk level, alerts, and farmer-friendly suggestions.

## Windy Point Forecast

No public endpoint is enabled in the MVP. The backend includes `WindyPointForecastClient` as a disabled skeleton for future forecast enrichment. It requires `ENABLE_WINDY_POINT_FORECAST=true` and `WINDY_POINT_FORECAST_API_KEY`.
