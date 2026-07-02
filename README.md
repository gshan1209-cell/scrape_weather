# Weather Farmer App

MVP monorepo for a Taiwan CWA OpenData weather dashboard with farmer-friendly weekly advice.

## Stack

- `apps/api`: FastAPI, Pydantic, httpx, SQLAlchemy-ready models
- `apps/web`: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-ready components

## Setup

Copy `.env.example` to `.env` and set `CWA_API_KEY` if you want live CWA data. Without a key, the API returns mock fallback data with the same response shape.

Weather map provider modes:

- `mock`: default, no third-party weather map API required.
- `windy`: client-only Windy Map Forecast API skeleton. Requires `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy` and a valid `NEXT_PUBLIC_WINDY_MAP_API_KEY`.

Do not use a Windy trial/testing key in production. Do not copy Windy branding or exact UI. CWA remains the main source for weekly forecasts and farmer advisory data.

### API

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Web

```powershell
cd apps/web
npm install
npm run dev
```

Open `http://localhost:3000`.

## API

- `GET /api/v1/health`
- `GET /api/v1/locations`
- `GET /api/v1/weather/weekly?city=Taipei&district=Beitou`
- `GET /api/v1/advisory/weekly?city=Taipei&district=Beitou&crop=rice`

FastAPI docs are available at `http://localhost:8000/docs`.

The backend also includes a disabled Windy Point Forecast client skeleton for future use. Enable it only with a valid `WINDY_POINT_FORECAST_API_KEY` and `ENABLE_WINDY_POINT_FORECAST=true`.

## Tests

```powershell
cd apps/api
pytest
```

```powershell
cd apps/web
npm run lint
npm run build
```

## Security

Keep the real CWA API key only in `.env`. The frontend uses `NEXT_PUBLIC_API_BASE_URL` and never receives the CWA key.
Windy Map Forecast keys are browser-visible by design, so configure domain restrictions and usage limits in the Windy account before production use.
