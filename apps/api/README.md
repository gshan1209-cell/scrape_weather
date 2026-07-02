# Weather Farmer API

FastAPI service for CWA weekly weather and farm work advisories.

Run locally:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API works without a CWA key by returning mock fallback weather.
