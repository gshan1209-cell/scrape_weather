# Data Flow

1. User chooses city, district, and crop in the Next.js UI.
2. The UI calls FastAPI endpoints under `/api/v1`.
3. FastAPI fetches CWA OpenData when `CWA_API_KEY` is configured.
4. If live data is unavailable, the API returns deterministic mock data.
5. Weather data is normalized into a stable response schema.
6. Advisory rules generate heat, rain, cold, and wind alerts.
7. The frontend renders a Leaflet + OpenStreetMap weather map hero. The default mock provider uses local overlay state only; the optional Windy provider loads third-party scripts in the browser and falls back safely on errors.
