# Architecture

The app is split into a frontend app and backend API.

```text
Next.js web app
  -> FastAPI /api/v1
  -> WeatherService
  -> CwaClient or mock fallback
  -> AdvisoryService
```

The SQLAlchemy models and repositories are present so the MVP can later add persistence without changing API contracts.

The web app also contains a weather map hero. It defaults to a client-only Leaflet map centered on Taiwan with OpenStreetMap tiles, mock weather overlays, layer controls, legend, timeline, and floating advisory. When configured with `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy` and a valid `NEXT_PUBLIC_WINDY_API_KEY`, the `WindyMapClient` loads Windy scripts client-side only and falls back to the Leaflet mock map if loading fails.
