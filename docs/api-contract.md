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
