# Data Flow

1. User chooses city, district, and crop in the Next.js UI.
2. The UI calls FastAPI endpoints under `/api/v1`.
3. FastAPI fetches CWA OpenData when `CWA_API_KEY` is configured.
4. If live data is unavailable, the API returns deterministic mock data.
5. Weather data is normalized into a stable response schema.
6. Advisory rules generate heat, rain, cold, and wind alerts.
