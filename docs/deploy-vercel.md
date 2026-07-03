# Vercel 上架設定

## 專案結構

本專案為 monorepo：

```
scrape_weather/
├── apps/
│   ├── web/       ← Vercel 部署目錄（Next.js）
│   └── api/       ← 後端 FastAPI（部署於 Render / Railway / Cloud Run）
├── docs/
└── specs/
```

## Vercel Project 設定

| 設定項 | 值 |
|--------|-----|
| Root Directory | `apps/web` |
| Framework Preset | Next.js |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | default（無需設定） |

## Vercel Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_WEATHER_MAP_PROVIDER=mock
NEXT_PUBLIC_WINDY_API_KEY=
NEXT_PUBLIC_WINDY_DEFAULT_LAT=23.6978
NEXT_PUBLIC_WINDY_DEFAULT_LON=120.9605
NEXT_PUBLIC_WINDY_DEFAULT_ZOOM=7
NEXT_PUBLIC_WINDY_DEFAULT_OVERLAY=rain
```

| 變數 | 必填 | 說明 |
|------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 是 | 後端 API 網址，結尾為 `/api/v1` |
| `NEXT_PUBLIC_WEATHER_MAP_PROVIDER` | 是 | `mock`（Leaflet + OSM）或 `windy` |
| `NEXT_PUBLIC_WINDY_API_KEY` | 否 | 使用 Windy 地圖時才需填寫 |
| `NEXT_PUBLIC_WINDY_DEFAULT_LAT` | 否 | 地圖預設緯度，預設台灣中心 |
| `NEXT_PUBLIC_WINDY_DEFAULT_LON` | 否 | 地圖預設經度，預設台灣中心 |
| `NEXT_PUBLIC_WINDY_DEFAULT_ZOOM` | 否 | 地圖預設縮放層級，預設 7 |
| `NEXT_PUBLIC_WINDY_DEFAULT_OVERLAY` | 否 | Windy 預設圖層（rain/wind/temperature/clouds/pressure） |

## 後端 FastAPI 部署

建議部署到 **Render** / **Railway** / **Google Cloud Run**，並設定以下環境變數：

```env
CWA_API_KEY=your_cwa_api_key
CWA_WEEKLY_DATASET_ID=F-D0047-091
CWA_VERIFY_SSL=true
APP_ENV=production
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CACHE_TTL_MINUTES=180
ENABLE_WINDY_POINT_FORECAST=false
```

| 變數 | 必填 | 說明 |
|------|------|------|
| `CWA_API_KEY` | 否 | CWA 開放資料 API 金鑰，未設定時回傳 mock 資料 |
| `CWA_WEEKLY_DATASET_ID` | 否 | 一週預報 dataset ID |
| `CWA_VERIFY_SSL` | 否 | 正式環境保持 `true` |
| `APP_ENV` | 否 | 設為 `production` 關閉 debug |
| `CORS_ORIGINS` | 是 | 允許的 Vercel 前端網域，多個用逗號分隔 |
| `CACHE_TTL_MINUTES` | 否 | 快取有效時間，預設 180 分鐘 |
| `ENABLE_WINDY_POINT_FORECAST` | 否 | MVP 保持 `false` |

## 安全注意事項

- **不要把 `CWA_API_KEY` 放在 Vercel 前端專案**。後端 API key 只應設定在後端環境變數中。
- 前端只能透過 `NEXT_PUBLIC_API_BASE_URL` 呼叫後端 API，不會直接取得 CWA key。
- 如果後端 API domain 改變，要同步更新 Vercel 的 `NEXT_PUBLIC_API_BASE_URL`。
- 如果前端 Vercel domain 改變，要同步更新後端 `CORS_ORIGINS`。
- Windy API key (`NEXT_PUBLIC_WINDY_API_KEY`) 屬於前端可見金鑰，正式環境請在 Windy 帳號中設定網域限制與用量限制。

## 部署步驟

### 1. 部署後端（FastAPI）

以 Render 為例：

1. 建立 Web Service，指向 repository
2. Root Directory 設為 `apps/api`
3. Build Command：`pip install -r requirements.txt`
4. Start Command：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. 設定後端環境變數（見上方表格）

### 2. 部署前端（Vercel）

1. Import Git repository 到 Vercel
2. Root Directory 設為 `apps/web`
3. Framework Preset 選擇 Next.js
4. 設定環境變數（見上方表格）
5. 將 `NEXT_PUBLIC_API_BASE_URL` 指向已部署的後端網址
6. Deploy

### 3. 驗證部署

1. 開啟 Vercel 提供的網域，確認首頁顯示農事天氣儀表板
2. 確認地圖可正常顯示（預設為 Leaflet + OpenStreetMap）
3. 確認後端 API 可連線（系統狀態顯示「後端連線正常」）
4. 若需啟用 Windy，設定 `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=windy` 及有效 API key

## 地圖提供者行為

| `NEXT_PUBLIC_WEATHER_MAP_PROVIDER` | `NEXT_PUBLIC_WINDY_API_KEY` | 行為 |
|--------------------------------------|------------------------------|------|
| `mock`（預設） | 任意 | 使用 Leaflet + OpenStreetMap + mock 天氣圖層 |
| `windy` | 未設定或無效 | 8 秒內自動 fallback 到 Leaflet |
| `windy` | 有效 | 使用 Windy Map Forecast |
