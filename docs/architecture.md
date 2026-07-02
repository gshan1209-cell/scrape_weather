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
