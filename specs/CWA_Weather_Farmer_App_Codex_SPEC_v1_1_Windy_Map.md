# CWA 一週天氣預測 × 農民提醒 App｜Codex 開發規格書 v1.1

日期：2026-07-02  
目標讀者：Codex / AI 開發 Agent  
專案類型：Monorepo Web App  
主要技術棧：

- `apps/web`: Next.js + TypeScript + Tailwind CSS + shadcn/ui-ready structure
- `apps/api`: FastAPI + Pydantic + SQLAlchemy-ready models

---

## 0. 給 Codex 的總指令

請依照本規格書建立一套「中央氣象署 OpenData 一週天氣預測 + 農民白話提醒 + Windy 風格氣象地圖視覺化」的 Monorepo 專案。

系統需包含：

1. Next.js 前端，位於 `apps/web`
2. FastAPI 後端，位於 `apps/api`
3. 後端負責代理中央氣象署 CWA OpenData API，不可把 CWA API Key 暴露在前端
4. 後端需提供一週天氣預測 API
5. 後端需提供農民提醒 API，將天氣資料轉成白話農事建議
6. 前端需提供首頁，顯示今日重點、一週預報、農事提醒、地區與作物設定
7. 前端需新增 Windy 風格氣象地圖區塊；MVP 可先做相似互動設計，若有 Windy Map Forecast API Key 則支援切換到 Windy Map Forecast API
8. 資料庫目前不是開發重點，但需保留 SQLAlchemy-ready models 與 repository 結構，方便未來接 SQLite / PostgreSQL / Supabase
9. shadcn/ui 不一定要立即安裝完整元件，但前端結構必須 shadcn/ui-ready

請優先完成可執行 MVP，不要過度工程化。

---

## 1. 專案目標

建立一個給農民使用的天氣決策助手，不只是顯示天氣，而是將氣象資料轉成「可行動提醒」。

核心價值：

```text
中央氣象署 OpenData
    ↓
後端標準化資料
    ↓
農事提醒規則引擎
    ↓
前端白話呈現
    ↓
協助農民安排澆水、採收、噴藥、戶外作業與排水管理
```

使用者看到的不是：

```text
降雨機率 70%
```

而是：

```text
明天下午降雨機率偏高，不建議安排噴藥。請上午完成田間作業，並提前檢查排水。
```

---

## 2. MVP 範圍

### 2.1 必做功能

- 前端首頁
  - 今日天氣摘要
  - 一週天氣預測
  - 高溫提醒
  - 降雨提醒
  - 農事建議
  - 縣市 / 鄉鎮 / 作物選擇 UI
- 後端 API
  - 健康檢查
  - 地區清單
  - 一週天氣預測
  - 一週農事提醒
- CWA OpenData 串接
  - 從後端呼叫
  - API Key 使用 `.env`
  - 不可出現在前端程式碼
- Pydantic response schema
- SQLAlchemy-ready models
- `.env.example`
- README 開發說明

### 2.2 暫不做功能

- 登入系統
- 會員資料
- 真正推播通知
- 後台管理系統
- AI 生成建議
- 複雜作物模型
- 大量資料庫 migration
- 多語系

---

## 3. 建議 Monorepo 結構

```text
weather-farmer-app/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   └── tsconfig.json
│   │
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── core/
│       │   ├── api/
│       │   ├── services/
│       │   ├── schemas/
│       │   ├── models/
│       │   ├── repositories/
│       │   └── tasks/
│       ├── tests/
│       ├── requirements.txt
│       └── README.md
│
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   └── data-flow.md
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. 系統資料流

```text
User opens Next.js homepage
    ↓
apps/web calls apps/api
    ↓
FastAPI checks cache / repository layer
    ↓
If no valid data, FastAPI calls CWA OpenData
    ↓
WeatherService normalizes raw CWA data
    ↓
AdvisoryService generates farmer-friendly advice
    ↓
FastAPI returns JSON
    ↓
Next.js renders cards, badges, alerts and weekly forecast
```

---

## 5. 環境變數設計

### 5.1 根目錄 `.env.example`

```env
# CWA OpenData API Key. Do not expose this in frontend code.
CWA_API_KEY=replace_with_your_cwa_api_key

# CWA dataset can be configured. Default can target Taiwan weekly forecast.
CWA_WEEKLY_DATASET_ID=F-D0047-091

# API
API_HOST=0.0.0.0
API_PORT=8000
APP_ENV=development

# Database is reserved for future use.
DATABASE_URL=sqlite:///./weather.db

# Cache
CACHE_TTL_MINUTES=180

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Weather map visualization
# mock: built-in Windy-inspired UI; windy: use Windy Map Forecast API when a valid key/license is available
NEXT_PUBLIC_WEATHER_MAP_PROVIDER=mock
NEXT_PUBLIC_WINDY_MAP_API_KEY=
NEXT_PUBLIC_WINDY_DEFAULT_LAT=23.6978
NEXT_PUBLIC_WINDY_DEFAULT_LON=120.9605
NEXT_PUBLIC_WINDY_DEFAULT_ZOOM=7
NEXT_PUBLIC_WINDY_DEFAULT_OVERLAY=rain
```

### 5.2 安全要求

- `CWA_API_KEY` 只能存在後端環境變數
- 前端不得出現 `Authorization=...`
- 不得 commit 真實 API Key
- `.env` 必須加入 `.gitignore`
- 只能提供 `.env.example`

---

## 6. apps/api 後端規格

### 6.1 後端技術

- FastAPI
- Pydantic
- httpx
- python-dotenv 或 pydantic-settings
- SQLAlchemy
- SQLite-ready，但目前不強制真的寫入資料庫
- pytest-ready

### 6.2 後端目錄

```text
apps/api/app/
├── main.py
│
├── core/
│   ├── config.py
│   ├── database.py
│   ├── constants.py
│   └── errors.py
│
├── api/
│   └── v1/
│       ├── router.py
│       ├── health.py
│       ├── locations.py
│       ├── weather.py
│       └── advisory.py
│
├── services/
│   ├── cwa_client.py
│   ├── weather_service.py
│   ├── advisory_service.py
│   └── cache_service.py
│
├── schemas/
│   ├── weather.py
│   ├── advisory.py
│   └── location.py
│
├── models/
│   ├── weather_snapshot.py
│   ├── location.py
│   ├── crop_profile.py
│   └── advisory_log.py
│
├── repositories/
│   ├── weather_repository.py
│   ├── location_repository.py
│   └── advisory_repository.py
│
└── tasks/
    ├── sync_weather.py
    └── cleanup_cache.py
```

---

## 7. 後端 API Contract

所有 API prefix：

```text
/api/v1
```

---

### 7.1 Health Check

```http
GET /api/v1/health
```

Response:

```json
{
  "status": "ok",
  "service": "weather-farmer-api",
  "version": "1.0.0"
}
```

驗收條件：

- 瀏覽器或 curl 可成功取得 JSON
- HTTP status code 為 `200`

---

### 7.2 Locations

```http
GET /api/v1/locations
```

Response:

```json
{
  "locations": [
    {
      "city": "臺中市",
      "districts": ["中區", "東區", "南區", "西區", "北區", "北屯區", "西屯區", "南屯區"]
    },
    {
      "city": "彰化縣",
      "districts": ["彰化市", "員林市", "鹿港鎮"]
    }
  ]
}
```

MVP 可先使用 hardcoded locations，未來再改成資料庫或 CWA 自動同步。

---

### 7.3 Weekly Weather

```http
GET /api/v1/weather/weekly?city=臺中市&district=北屯區
```

Query parameters:

| Name | Type | Required | Description |
|---|---|---:|---|
| city | string | yes | 縣市，例如 `臺中市` |
| district | string | no | 鄉鎮區，例如 `北屯區` |

Response:

```json
{
  "city": "臺中市",
  "district": "北屯區",
  "updatedAt": "2026-07-02T08:00:00+08:00",
  "source": "CWA OpenData",
  "days": [
    {
      "date": "2026-07-02",
      "weather": "多雲午後短暫雷陣雨",
      "minTemp": 25,
      "maxTemp": 36,
      "rainProbability": 70,
      "comfort": "悶熱",
      "uvIndex": 8,
      "windDescription": "偏南風",
      "rawTimeRange": "2026-07-02T06:00:00+08:00/2026-07-02T18:00:00+08:00"
    }
  ]
}
```

錯誤回應：

```json
{
  "detail": "Unable to fetch weather data"
}
```

驗收條件：

- API 可在沒有資料庫的情況下正常回傳 mock 或 CWA normalized data
- 若 CWA API Key 不存在，需回傳清楚錯誤，不可讓後端崩潰
- response shape 必須固定，前端可穩定使用

---

### 7.4 Weekly Advisory

```http
GET /api/v1/advisory/weekly?city=臺中市&district=北屯區&crop=水稻
```

Query parameters:

| Name | Type | Required | Description |
|---|---|---:|---|
| city | string | yes | 縣市 |
| district | string | no | 鄉鎮區 |
| crop | string | no | 作物，例如 `水稻`、`葉菜`、`果樹` |

Response:

```json
{
  "city": "臺中市",
  "district": "北屯區",
  "crop": "水稻",
  "summary": "本週高溫且午後降雨機率偏高，建議避開中午戶外作業，並提前檢查排水。",
  "riskLevel": "warning",
  "alerts": [
    {
      "level": "danger",
      "type": "heat",
      "title": "高溫作業風險",
      "message": "最高溫可能達 35°C 以上，建議避開 11:00–15:00 戶外作業。"
    },
    {
      "level": "warning",
      "type": "rain",
      "title": "降雨與雷雨風險",
      "message": "本週降雨機率偏高，噴藥、施肥與採收建議安排在上午。"
    }
  ],
  "suggestions": [
    "戶外作業建議安排在清晨或傍晚。",
    "午後留意短時強降雨與田間積水。",
    "水稻田區應提前巡視排水溝與田埂狀況。"
  ]
}
```

驗收條件：

- 會根據一週天氣資料產生提醒
- 高溫、降雨、低溫、強風至少先保留判斷欄位
- MVP 可先完成高溫與降雨規則

---

## 8. Pydantic Schemas

### 8.1 `schemas/weather.py`

需建立以下 schema：

```python
from pydantic import BaseModel
from typing import List, Optional


class DailyWeather(BaseModel):
    date: str
    weather: str
    minTemp: Optional[int] = None
    maxTemp: Optional[int] = None
    rainProbability: Optional[int] = None
    comfort: Optional[str] = None
    uvIndex: Optional[int] = None
    windDescription: Optional[str] = None
    rawTimeRange: Optional[str] = None


class WeeklyWeatherResponse(BaseModel):
    city: str
    district: Optional[str] = None
    updatedAt: str
    source: str = "CWA OpenData"
    days: List[DailyWeather]
```

### 8.2 `schemas/advisory.py`

```python
from pydantic import BaseModel
from typing import List, Optional


class AdvisoryAlert(BaseModel):
    level: str
    type: str
    title: str
    message: str


class WeeklyAdvisoryResponse(BaseModel):
    city: str
    district: Optional[str] = None
    crop: Optional[str] = None
    summary: str
    riskLevel: str
    alerts: List[AdvisoryAlert]
    suggestions: List[str]
```

### 8.3 `schemas/location.py`

```python
from pydantic import BaseModel
from typing import List


class LocationItem(BaseModel):
    city: str
    districts: List[str]


class LocationListResponse(BaseModel):
    locations: List[LocationItem]
```

---

## 9. SQLAlchemy-ready Models

資料庫不是 MVP 核心，但需建立 models，方便未來接 SQLite / PostgreSQL / Supabase。

### 9.1 `models/weather_snapshot.py`

```python
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.core.database import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=True)
    source_dataset = Column(String, nullable=True)
    raw_data = Column(JSON, nullable=True)
    normalized_data = Column(JSON, nullable=True)
    fetched_at = Column(DateTime, nullable=False)
```

### 9.2 `models/location.py`

```python
from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
```

### 9.3 `models/crop_profile.py`

```python
from sqlalchemy import Column, Integer, String, JSON
from app.core.database import Base


class CropProfile(Base):
    __tablename__ = "crop_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    risk_rules = Column(JSON, nullable=True)
```

### 9.4 `models/advisory_log.py`

```python
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.core.database import Base


class AdvisoryLog(Base):
    __tablename__ = "advisory_logs"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=True)
    crop = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)
    advisory_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False)
```

---

## 10. CWA Client 規格

### 10.1 `services/cwa_client.py`

功能：

- 使用 `httpx.AsyncClient`
- 從 `.env` 讀取 `CWA_API_KEY`
- 支援 dataset id configurable
- 支援 locationName parameter
- 捕捉 timeout / HTTP error
- 回傳 raw JSON

參考實作方向：

```python
import httpx
from app.core.config import settings


class CwaClient:
    BASE_URL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore"

    async def fetch_weekly_forecast(self, dataset_id: str, location_name: str | None = None) -> dict:
        if not settings.CWA_API_KEY:
            raise ValueError("CWA_API_KEY is not configured")

        params = {
            "Authorization": settings.CWA_API_KEY,
            "format": "JSON",
        }

        if location_name:
            params["locationName"] = location_name

        url = f"{self.BASE_URL}/{dataset_id}"

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()
```

---

## 11. WeatherService 規格

### 11.1 `services/weather_service.py`

功能：

1. 接收 `city`、`district`
2. 呼叫 `CwaClient`
3. 將 CWA raw data 轉成固定 `WeeklyWeatherResponse`
4. 若 CWA API 不可用，可回傳 mock fallback data，但 response 中需清楚標示來源，例如 `Mock Weather Data`
5. 不可讓前端因資料缺欄位而崩潰

### 11.2 Normalization 原則

不同 CWA dataset 的 raw JSON 結構可能不同，MVP 請先實作防禦式解析：

- 找不到欄位時回傳 `None`
- `weather` 預設為 `資料整理中`
- `days` 至少回傳空陣列，不可回傳 null
- 日期需轉成 `YYYY-MM-DD`
- 溫度轉成 integer
- 降雨機率轉成 integer percentage

---

## 12. AdvisoryService 規格

### 12.1 `services/advisory_service.py`

輸入：

```python
days: list[dict]
crop: str | None
```

輸出：

```python
{
    "summary": str,
    "riskLevel": str,
    "alerts": list[dict],
    "suggestions": list[str]
}
```

### 12.2 MVP 規則

| 條件 | Risk | Alert |
|---|---|---|
| 最高溫 >= 35 | danger | 高溫作業風險 |
| 降雨機率 >= 60 | warning | 降雨與雷雨風險 |
| 最低溫 <= 12 | warning | 低溫風險 |
| 風力描述含強風 | warning | 強風棚架風險 |

### 12.3 作物提醒

| 作物 | 建議 |
|---|---|
| 水稻 | 注意田間積水、排水溝、田埂狀況 |
| 葉菜 | 注意高溫萎凋、強降雨後腐爛與病害 |
| 果樹 | 注意強風落果、棚架固定、排水 |
| 未指定 | 提供通用農事建議 |

---

## 13. apps/web 前端規格

### 13.1 前端技術

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-ready
- Mobile-first RWD
- fetch API 或 SWR / React Query 皆可

MVP 可使用原生 `fetch`，但需把 API 呼叫集中在 `features/*/api.ts`。

---

## 14. 前端目錄

```text
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── forecast/
│   │   └── page.tsx
│   ├── advisory/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── BottomNav.tsx
│   │   └── PageContainer.tsx
│   │
│   ├── weather/
│   │   ├── CurrentWeatherCard.tsx
│   │   ├── WeeklyForecastCard.tsx
│   │   ├── DailyWeatherItem.tsx
│   │   ├── RainRiskBadge.tsx
│   │   └── TemperatureRange.tsx
│   │
│   ├── farmer/
│   │   ├── FarmerAdviceCard.tsx
│   │   ├── AlertBanner.tsx
│   │   ├── CropSelector.tsx
│   │   └── WorkSuggestionCard.tsx
│   │
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── select.tsx
│
├── features/
│   ├── weather/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── advisory/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   └── location/
│       ├── api.ts
│       ├── hooks.ts
│       └── types.ts
│
├── lib/
│   ├── api-client.ts
│   ├── utils.ts
│   └── constants.ts
│
└── types/
    └── index.ts
```

---

## 15. 前端頁面需求

### 15.1 首頁 `app/page.tsx`

首頁需包含：

1. 頁首
   - App 名稱：`農民天氣決策助手`
   - 副標：`一週天氣 × 農事提醒`
2. 地區設定區
   - 縣市 select
   - 鄉鎮 select
   - 作物 select
3. 今日重點 Card
   - 今日天氣
   - 最高 / 最低溫
   - 降雨機率
   - 風險等級
4. 農事提醒區
   - summary
   - alerts
   - suggestions
5. 一週預報區
   - 每日天氣 card list
6. Loading / Error / Empty states

---

## 16. 前端 TypeScript Types

### 16.1 `features/weather/types.ts`

```ts
export type DailyWeather = {
  date: string;
  weather: string;
  minTemp?: number | null;
  maxTemp?: number | null;
  rainProbability?: number | null;
  comfort?: string | null;
  uvIndex?: number | null;
  windDescription?: string | null;
  rawTimeRange?: string | null;
};

export type WeeklyWeatherResponse = {
  city: string;
  district?: string | null;
  updatedAt: string;
  source: string;
  days: DailyWeather[];
};
```

### 16.2 `features/advisory/types.ts`

```ts
export type AdvisoryAlert = {
  level: "info" | "warning" | "danger" | string;
  type: string;
  title: string;
  message: string;
};

export type WeeklyAdvisoryResponse = {
  city: string;
  district?: string | null;
  crop?: string | null;
  summary: string;
  riskLevel: "normal" | "warning" | "danger" | string;
  alerts: AdvisoryAlert[];
  suggestions: string[];
};
```

---

## 17. 前端 API Client

### 17.1 `lib/api-client.ts`

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

---

## 18. UI / UX 要求

### 18.1 視覺方向

- 乾淨、清楚、手機優先
- 適合農民快速閱讀
- 大字體、卡片式資訊
- 重點提醒放最上方
- 顏色語意：
  - normal：一般
  - warning：注意
  - danger：高風險

### 18.2 文案原則

避免只顯示專業數字，需轉成白話：

```text
不好：降雨機率 70%
好：午後下雨機率高，不建議安排噴藥。
```

```text
不好：最高溫 36°C
好：中午前後偏熱，戶外作業建議安排在清晨或傍晚。
```

---

## 19. CORS 設定

FastAPI 需允許本機前端開發：

```text
http://localhost:3000
```

production origin 可先由 env 設定，MVP 不需複雜權限。

---

## 20. README 需求

根目錄 README 需包含：

1. 專案介紹
2. 技術棧
3. 目錄結構
4. 環境變數設定
5. 後端啟動方式
6. 前端啟動方式
7. API endpoint 說明
8. 安全提醒：CWA API Key 不可放前端

### 20.1 後端啟動範例

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Windows PowerShell 可補充：

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 20.2 前端啟動範例

```bash
cd apps/web
npm install
npm run dev
```

---

## 21. 測試需求

### 21.1 後端測試

至少建立：

```text
apps/api/tests/test_health.py
apps/api/tests/test_advisory_service.py
```

測試項目：

- `/api/v1/health` 回傳 200
- 高溫資料會產生 heat alert
- 高降雨機率會產生 rain alert
- 空資料不會導致系統崩潰

### 21.2 前端檢查

至少需通過：

```bash
npm run lint
npm run build
```

若專案初期尚未配置 lint，可在 README 說明。

---

## 22. 開發任務切分

### P0｜專案骨架

- 建立 monorepo 目錄
- 建立 `apps/web`
- 建立 `apps/api`
- 建立 `.env.example`
- 建立根目錄 README

驗收：

- 目錄結構符合規格
- 前後端可以分別啟動

---

### P1｜FastAPI MVP

- 建立 FastAPI app
- 建立 `/api/v1/health`
- 建立 `/api/v1/locations`
- 建立 schema
- 建立 CWA client
- 建立 weather service
- 建立 advisory service
- 建立 `/api/v1/weather/weekly`
- 建立 `/api/v1/advisory/weekly`

驗收：

- Swagger `/docs` 可看到 API
- API 可回傳固定 JSON shape
- 無 CWA API Key 時有清楚錯誤或 fallback

---

### P2｜Next.js MVP

- 建立首頁
- 建立 layout
- 建立天氣卡片
- 建立農事提醒卡片
- 建立地區與作物 select
- 串接後端 API
- 加入 loading / error states

驗收：

- 首頁可顯示一週預報
- 首頁可顯示農事提醒
- 改變地區 / 作物後可重新取得資料
- 手機版可讀性良好

---

### P3｜SQLAlchemy-ready 結構

- 建立 `core/database.py`
- 建立 models
- 建立 repositories placeholder
- 不強制開 migration
- 不強制真的寫入 DB

驗收：

- models 可 import
- FastAPI 啟動不會因 DB 設定缺失而失敗

---

### P4｜文件與驗收

- 補 README
- 補 docs
- 補 API contract
- 補測試
- 確認沒有 API Key 外洩

驗收：

- 新開發者可照 README 啟動
- 測試可執行
- API contract 與實作一致

---

## 23. Codex 開發注意事項

1. 不要一次重構過多檔案
2. 優先讓 MVP 能跑
3. 不要硬編真實 CWA API Key
4. 若無法確認 CWA raw JSON 結構，先用防禦式 parser + mock fallback
5. 前後端 response type 必須一致
6. 前端 UI 先清楚，不追求華麗
7. 後端保留 SQLAlchemy-ready 結構，但不要把資料庫變成阻礙
8. 每完成一階段，請列出完成項目與尚未完成項目
9. 所有錯誤狀態需能被前端顯示
10. 禁止把 secrets commit 到 repo

---

## 24. 最終驗收標準

Codex 完成後，專案需達成：

- `apps/api` 可啟動 FastAPI
- `apps/api` 有 `/api/v1/health`
- `apps/api` 有 `/api/v1/weather/weekly`
- `apps/api` 有 `/api/v1/advisory/weekly`
- `apps/web` 可啟動 Next.js
- 首頁可看到：
  - 今日重點
  - 一週預報
  - 農事提醒
  - 地區 / 作物選擇
- CWA API Key 只存在後端 `.env`
- 沒有真實 key 出現在 git tracked files
- README 可讓新開發者照步驟啟動
- TypeScript 無明顯型別錯誤
- Python import 無明顯錯誤

---

## 25. 建議 Codex 第一段指令

可直接貼給 Codex：

```text
請依照 docs/CWA_Weather_Farmer_App_Codex_SPEC_v1_1.md 建立 MVP。

技術棧固定：
- apps/web: Next.js + TypeScript + Tailwind CSS + shadcn/ui-ready structure
- apps/api: FastAPI + Pydantic + SQLAlchemy-ready models

優先完成：
1. Monorepo 目錄
2. FastAPI health / locations / weather weekly / advisory weekly API
3. Next.js 首頁顯示今日重點、一週預報、農事提醒
4. CWA API Key 只放後端環境變數
5. SQLAlchemy models 先建立 ready structure，但不要讓資料庫阻礙 MVP
6. README 與 .env.example

請分階段開發，完成後回報：
- 新增 / 修改的檔案
- 啟動方式
- 測試方式
- 尚未完成或使用 mock fallback 的地方
```

---

## 26. 後續可擴充方向

MVP 完成後可再擴充：

1. 節氣農產提醒
2. 作物風險規則管理
3. 天氣歷史資料儲存
4. 農民通知推播
5. 後台規則管理
6. Supabase / PostgreSQL
7. 使用者收藏地區
8. 多作物 profile
9. AI 生成白話提醒
10. Line Bot / PWA



---

# v1.1 新增需求：Windy 風格氣象地圖視覺化

## A. 重要決策

本專案新增「Weather Map」模組，目標是讓首頁具有類似 Windy 的氣象地圖體驗：

```text
大面積互動地圖
    ↓
圖層切換：降雨 / 風場 / 溫度 / 雲量
    ↓
底部時間軸：今天至未來一週
    ↓
地圖浮層卡片：農事提醒 / 高溫 / 降雨 / 作業建議
```

但開發時必須遵守以下原則：

1. 不可仿冒 Windy 商標、Logo、完整 UI 或品牌識別。
2. 可參考其「氣象圖層 + 時間軸 + 圖例 + 地點 picker」的互動邏輯。
3. MVP 預設使用 `mock` / `fallback` 模式，做出相似地圖體驗。
4. 若有合法 Windy Map Forecast API Key，再啟用 `windy` provider。
5. CWA 仍是農民提醒與一週預報的主要資料來源。
6. Windy Map Forecast API 只作為視覺化地圖，不取代後端 CWA 資料流程。

---

## B. Windy API 技術參考

Codex 開發前請理解以下限制：

- Windy Map Forecast API 是基於 Leaflet 1.4.x 的 JavaScript map library。
- Windy Map Forecast API 可顯示 layers、particles、legend、picker、isolines、controls 與 map。
- Windy Point Forecast API 是機器可讀天氣資料 API，需用 `POST https://api.windy.com/api/point-forecast/v2`。
- 本專案 MVP 不必使用 Point Forecast API，避免資料源混亂。
- Windy Trial / Testing API 只能作開發測試，不可當 production 使用。
- 若 production 使用 Windy API，需確認授權、domain restriction、sessions/day、使用條款與 API key 保護。

參考文件：

```text
https://api.windy.com/map-forecast/docs
https://api.windy.com/map-forecast/pricing
https://api.windy.com/point-forecast/docs
https://account.windy.com/agreements/windy-api-map-and-point-forecast-terms-of-use
```

---

## C. 地圖模組定位

### C.1 MVP 預設模式：Windy-inspired Fallback Map

不需要 Windy API Key 即可啟動。

功能：

- 顯示台灣地圖區塊或地圖風格背景
- 顯示目前選擇地區 marker
- 顯示圖層切換 UI
- 顯示時間軸 UI
- 顯示圖例 legend
- 顯示農事提醒浮層
- 若未接 Leaflet，可先用 CSS gradient + SVG marker 建立 mock map

這個模式的目標是讓產品 demo 先能跑，不被第三方 API / 授權卡住。

### C.2 可選模式：Windy Map Forecast API Provider

當 `.env` 設定：

```env
NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy
NEXT_PUBLIC_WINDY_MAP_API_KEY=your_windy_map_api_key
```

前端才載入 Windy Map Forecast API。

必要要求：

- 只能在 client component 載入
- 不得 SSR
- 使用 Next.js dynamic import 或 `<Script />`
- 若 key 缺失或載入失敗，要 fallback 到 `mock` 模式
- 不得讓整個首頁 crash

---

## D. apps/web 新增目錄結構

請在 `apps/web` 新增以下結構：

```text
apps/web/
├── components/
│   ├── map/
│   │   ├── WeatherMapShell.tsx
│   │   ├── WindyInspiredMap.tsx
│   │   ├── WindyMapClient.tsx
│   │   ├── MapLayerControl.tsx
│   │   ├── MapTimeline.tsx
│   │   ├── MapLegend.tsx
│   │   ├── MapFloatingAdvice.tsx
│   │   └── MapProviderFallback.tsx
│   │
│   └── ui/
│       └── shadcn-ready components
│
├── features/
│   ├── weather-map/
│   │   ├── config.ts
│   │   ├── types.ts
│   │   ├── useWeatherMapState.ts
│   │   └── overlay-options.ts
│   │
│   └── weather/
│       ├── api.ts
│       ├── hooks.ts
│       └── types.ts
│
└── types/
    └── windy.d.ts
```

---

## E. Weather Map UI 規格

首頁建議版面：

```text
首頁
├── Top Bar
│   ├── App name
│   ├── Location selector
│   └── Crop selector
│
├── Weather Map Hero
│   ├── Full-width map container
│   ├── Layer control
│   │   ├── Rain
│   │   ├── Wind
│   │   ├── Temperature
│   │   └── Clouds
│   ├── Floating farmer advice card
│   ├── Map legend
│   └── Time slider / play button
│
├── Today Decision Cards
│   ├── 是否適合噴藥
│   ├── 是否注意高溫
│   ├── 是否注意排水
│   └── 建議作業時段
│
└── Weekly Forecast Cards
```

### E.1 桌面版

- 地圖高度：`min-h-[520px]`
- 右側垂直 layer control
- 底部 timeline bar
- 左上角顯示目前地區與資料來源
- 左下角顯示農事提醒浮層

### E.2 手機版

- 地圖高度：`h-[420px]`
- layer control 改為水平 pill buttons
- timeline 固定在地圖底部
- advice card 可收合
- 避免 picker 依賴桌機互動

---

## F. 前端 TypeScript Types

```ts
// apps/web/features/weather-map/types.ts

export type WeatherMapProvider = "mock" | "windy";

export type WeatherOverlay =
  | "rain"
  | "wind"
  | "temperature"
  | "clouds"
  | "pressure";

export interface WeatherMapLocation {
  city: string;
  district?: string;
  lat: number;
  lon: number;
}

export interface WeatherMapConfig {
  provider: WeatherMapProvider;
  defaultLat: number;
  defaultLon: number;
  defaultZoom: number;
  defaultOverlay: WeatherOverlay;
  windyApiKey?: string;
}

export interface WeatherMapState {
  overlay: WeatherOverlay;
  selectedTimeIndex: number;
  isPlaying: boolean;
  location: WeatherMapLocation;
}
```

```ts
// apps/web/types/windy.d.ts

declare global {
  interface Window {
    windyInit?: (
      options: Record<string, unknown>,
      callback: (windyAPI: {
        map: unknown;
        store: {
          get: (key: string) => unknown;
          set: (key: string, value: unknown, opts?: Record<string, unknown>) => void;
          on: (key: string, callback: (...args: unknown[]) => void) => void;
          off: (key: string, callback: (...args: unknown[]) => void) => void;
        };
        picker?: {
          open: (params: { lat: number; lon: number }) => void;
          close: () => void;
          getParams: () => unknown;
        };
      }) => void
    ) => void;
  }
}

export {};
```

---

## G. WeatherMapShell 設計

```tsx
// apps/web/components/map/WeatherMapShell.tsx

"use client";

import { WindyInspiredMap } from "./WindyInspiredMap";
import { WindyMapClient } from "./WindyMapClient";
import { getWeatherMapConfig } from "@/features/weather-map/config";

export function WeatherMapShell() {
  const config = getWeatherMapConfig();

  if (config.provider === "windy" && config.windyApiKey) {
    return <WindyMapClient config={config} />;
  }

  return <WindyInspiredMap config={config} />;
}
```

---

## H. WindyInspiredMap Fallback 規格

```tsx
// apps/web/components/map/WindyInspiredMap.tsx

"use client";

import { useWeatherMapState } from "@/features/weather-map/useWeatherMapState";
import { MapLayerControl } from "./MapLayerControl";
import { MapTimeline } from "./MapTimeline";
import { MapLegend } from "./MapLegend";
import { MapFloatingAdvice } from "./MapFloatingAdvice";

export function WindyInspiredMap() {
  const map = useWeatherMapState();

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-slate-950 text-white shadow-sm">
      <div className="min-h-[420px] md:min-h-[520px] bg-[radial-gradient(circle_at_center,_#2563eb,_#0f172a_60%)]">
        <div className="absolute inset-0 opacity-40">
          {/* TODO: 可用 CSS/SVG 做風場粒子、雨雲漸層、溫度熱區 */}
        </div>

        <div className="absolute left-4 top-4 rounded-2xl bg-black/40 px-4 py-3 backdrop-blur">
          <p className="text-xs text-white/70">Weather map</p>
          <h2 className="text-lg font-semibold">Taiwan weekly forecast</h2>
        </div>

        <MapLayerControl
          value={map.overlay}
          onChange={map.setOverlay}
        />

        <MapFloatingAdvice />

        <MapLegend overlay={map.overlay} />

        <MapTimeline
          value={map.selectedTimeIndex}
          isPlaying={map.isPlaying}
          onChange={map.setSelectedTimeIndex}
          onPlayToggle={map.togglePlaying}
        />
      </div>
    </section>
  );
}
```

MVP 驗收：

- 無 Windy key 時仍能看到地圖視覺化區塊。
- 圖層按鈕切換時，legend 與背景效果需有明顯變化。
- 時間軸可拖曳或點選，畫面顯示目前時間區段。
- 不需要真實粒子動畫，但 UI 要有完成度。

---

## I. WindyMapClient 規格

當啟用 `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy` 時使用。

### I.1 套件與 Script 載入

Windy Map Forecast API 文件要求加入 Leaflet 1.4.0 與 Windy library：

```text
https://unpkg.com/leaflet@1.4.0/dist/leaflet.js
https://api.windy.com/assets/map-forecast/libBoot.js
```

Next.js 建議用 `next/script`：

```tsx
// apps/web/components/map/WindyMapClient.tsx

"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { WeatherMapConfig, WeatherOverlay } from "@/features/weather-map/types";
import { MapProviderFallback } from "./MapProviderFallback";

type Props = {
  config: WeatherMapConfig;
};

export function WindyMapClient({ config }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [windyLoaded, setWindyLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!leafletLoaded || !windyLoaded || !window.windyInit || !containerRef.current) return;

    try {
      window.windyInit(
        {
          key: config.windyApiKey,
          lat: config.defaultLat,
          lon: config.defaultLon,
          zoom: config.defaultZoom,
          overlay: normalizeWindyOverlay(config.defaultOverlay),
        },
        (windyAPI) => {
          windyAPI.store.set("overlay", normalizeWindyOverlay(config.defaultOverlay));
        }
      );
    } catch (error) {
      console.error("Failed to initialize Windy map", error);
      setFailed(true);
    }
  }, [leafletLoaded, windyLoaded, config]);

  if (failed) {
    return <MapProviderFallback reason="Windy map failed to load." />;
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border bg-slate-950 shadow-sm">
      <Script
        src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setLeafletLoaded(true)}
        onError={() => setFailed(true)}
      />
      <Script
        src="https://api.windy.com/assets/map-forecast/libBoot.js"
        strategy="afterInteractive"
        onLoad={() => setWindyLoaded(true)}
        onError={() => setFailed(true)}
      />

      <div id="windy" ref={containerRef} className="h-[420px] w-full md:h-[520px]" />
    </section>
  );
}

function normalizeWindyOverlay(overlay: WeatherOverlay) {
  const map: Record<WeatherOverlay, string> = {
    rain: "rain",
    wind: "wind",
    temperature: "temp",
    clouds: "clouds",
    pressure: "pressure",
  };

  return map[overlay] ?? "rain";
}
```

### I.2 注意事項

- `WindyMapClient` 必須是 client component。
- 不要在 server component 直接讀取 `window`。
- 若 Windy API 無法載入，必須 fallback。
- 不要混用新版 Leaflet 與 Windy 要求的 Leaflet 1.4.0。
- 若未確認 Windy API 授權，不得設為 production 預設 provider。

---

## J. overlay-options.ts

```ts
// apps/web/features/weather-map/overlay-options.ts

import type { WeatherOverlay } from "./types";

export const WEATHER_OVERLAY_OPTIONS: Array<{
  value: WeatherOverlay;
  label: string;
  description: string;
}> = [
  {
    value: "rain",
    label: "Rain",
    description: "降雨與雷雨風險",
  },
  {
    value: "wind",
    label: "Wind",
    description: "風向與風速",
  },
  {
    value: "temperature",
    label: "Temperature",
    description: "高溫與低溫區域",
  },
  {
    value: "clouds",
    label: "Clouds",
    description: "雲量與日照變化",
  },
  {
    value: "pressure",
    label: "Pressure",
    description: "氣壓變化參考",
  },
];
```

---

## K. useWeatherMapState

```ts
// apps/web/features/weather-map/useWeatherMapState.ts

"use client";

import { useMemo, useState } from "react";
import type { WeatherOverlay } from "./types";

const TIME_LABELS = [
  "Now",
  "+6h",
  "+12h",
  "+24h",
  "+2d",
  "+3d",
  "+4d",
  "+5d",
  "+6d",
  "+7d",
];

export function useWeatherMapState() {
  const [overlay, setOverlay] = useState<WeatherOverlay>("rain");
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTimeLabel = useMemo(
    () => TIME_LABELS[selectedTimeIndex] ?? "Now",
    [selectedTimeIndex]
  );

  return {
    overlay,
    setOverlay,
    selectedTimeIndex,
    setSelectedTimeIndex,
    isPlaying,
    setIsPlaying,
    togglePlaying: () => setIsPlaying((value) => !value),
    timeLabels: TIME_LABELS,
    currentTimeLabel,
  };
}
```

---

## L. 後端可選 Windy Point Forecast Client

MVP 不要求，但請預留結構，避免之後要比較 CWA / Windy / GFS 時大改。

新增：

```text
apps/api/app/services/windy_client.py
apps/api/app/schemas/windy.py
```

### L.1 環境變數

```env
WINDY_POINT_FORECAST_API_KEY=
ENABLE_WINDY_POINT_FORECAST=false
```

### L.2 Client skeleton

```python
# apps/api/app/services/windy_client.py

import httpx
from app.core.config import settings


class WindyPointForecastClient:
    BASE_URL = "https://api.windy.com/api/point-forecast/v2"

    async def fetch_point_forecast(
        self,
        lat: float,
        lon: float,
        model: str = "gfs",
        parameters: list[str] | None = None,
    ) -> dict:
        if not settings.WINDY_POINT_FORECAST_API_KEY:
            raise RuntimeError("WINDY_POINT_FORECAST_API_KEY is not configured")

        payload = {
            "lat": lat,
            "lon": lon,
            "model": model,
            "parameters": parameters or ["wind", "temp", "rh", "pressure"],
            "levels": ["surface"],
            "key": settings.WINDY_POINT_FORECAST_API_KEY,
        }

        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(self.BASE_URL, json=payload)
            response.raise_for_status()
            return response.json()
```

注意：

- 不要預設開啟 Point Forecast。
- 不要把 Windy Point Forecast API Key 放前端。
- 若要啟用，需新增清楚的資料來源標示，避免使用者以為農事建議全部來自 CWA。

---

## M. 首頁整合要求

請將首頁順序調整為：

```text
1. 今日行動建議 / 今日判斷
2. Windy 風格 Weather Map Hero
3. 一週天氣預測卡片
4. 農事提醒詳細列表
5. 地區 / 作物設定
```

首頁資料顯示邏輯：

- Weather Map Hero 主要呈現「空間感與氣象風險」
- 今日行動建議要放在地圖上方或地圖浮層中
- 一週預報卡片提供細節
- 農事提醒卡片提供具體可執行建議

---

## N. shadcn/ui-ready 元件建議

不強制安裝，但結構要能接：

```text
Button
Card
Badge
Tabs
Select
Slider
Sheet
Popover
Skeleton
Alert
```

地圖模組對應：

```text
MapLayerControl     → Button / Tabs
MapTimeline         → Slider / Button
MapFloatingAdvice   → Card / Alert / Badge
Location selector   → Select / Popover
Mobile settings     → Sheet
Loading state       → Skeleton
```

---

## O. Codex 新增任務清單

### O.1 任務：新增 Weather Map 前端模組

請完成：

1. 建立 `features/weather-map` types/config/state。
2. 建立 `components/map` 全部元件。
3. 在首頁插入 `WeatherMapShell`。
4. 預設 provider 使用 `mock`。
5. 地圖 UI 支援 overlay 切換。
6. 地圖 UI 支援 timeline 切換。
7. 無 Windy key 不得報錯。

驗收：

- `npm run dev` 可看到地圖區塊。
- 點選 Rain / Wind / Temperature / Clouds，UI 狀態有變化。
- 點選時間軸，UI 狀態有變化。
- mobile width 下不破版。

### O.2 任務：新增 Windy Provider 可選整合

請完成：

1. 建立 `WindyMapClient.tsx`。
2. 使用 `next/script` 載入 Leaflet 1.4.0 與 Windy Map Forecast API lib。
3. 只在 `provider=windy` 且有 key 時載入。
4. 載入失敗 fallback。
5. 在 README 說明 Windy API Key 與授權注意事項。

驗收：

- `.env.local` 未設定 Windy key 時仍能正常顯示 mock map。
- `.env.local` 設定 `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy` 但 key 空白時，自動 fallback。
- 不在 server side 存取 `window`。
- TypeScript 沒有 `window.windyInit` 型別錯誤。

### O.3 任務：README 更新

README 新增：

```text
Weather map provider modes:
- mock: default, no third-party weather map API required
- windy: requires valid Windy Map Forecast API key/license

Do not use Windy trial/testing key in production.
Do not copy Windy branding or exact UI.
CWA remains the main source for weekly forecast and farmer advisory.
```

---

## P. 新增驗收標準

在原本最終驗收標準之外，新增：

- 首頁有 Weather Map Hero。
- 預設 `mock` 模式可運作。
- 地圖 layer control 可切換。
- 地圖 timeline 可操作。
- 地圖區塊有 loading / fallback / error 狀態。
- Windy provider 只在 client side 載入。
- 未設定 Windy key 不會讓首頁 crash。
- README 清楚標示 Windy API 授權注意事項。
- 不得使用 Windy Logo 或仿冒其完整品牌識別。

---

## Q. 更新後給 Codex 的指令

可直接貼給 Codex：

```text
請依照 docs/CWA_Weather_Farmer_App_Codex_SPEC_v1_1.md 建立 MVP。

技術棧固定：
- apps/web: Next.js + TypeScript + Tailwind CSS + shadcn/ui-ready structure
- apps/api: FastAPI + Pydantic + SQLAlchemy-ready models

新增要求：
- 參考 Windy.com 的氣象地圖體驗，但不可複製品牌、Logo 或完整 UI。
- 首頁需新增 Weather Map Hero。
- 預設使用 mock / fallback provider，不需 Windy API Key 也能顯示。
- 若設定 NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy 且提供合法 Windy Map Forecast API Key，才載入 Windy Map Forecast API。
- Windy provider 必須是 client-only，不能 SSR，載入失敗必須 fallback。
- CWA 仍是主要天氣與農事建議資料來源。

優先完成：
1. Monorepo 目錄
2. FastAPI health / locations / weather weekly / advisory weekly API
3. Next.js 首頁顯示今日行動建議、Weather Map Hero、一週預報、農事提醒
4. Weather Map mock provider：layer control + timeline + legend + floating advice
5. Windy provider skeleton：client-only + fallback + README 說明
6. CWA API Key 只放後端環境變數
7. SQLAlchemy models 先建立 ready structure，但不要讓資料庫阻礙 MVP
8. README 與 .env.example

請分階段開發，完成後回報：
- 新增 / 修改的檔案
- 啟動方式
- 測試方式
- 尚未完成或使用 mock fallback 的地方
```
