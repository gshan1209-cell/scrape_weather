# 開發進度報告

> Git Repo：https://github.com/gshan1209-cell/scrape_weather  
> 目的：CWA 中央氣象署 OpenData × 農事天氣儀表板 × Leaflet / Windy 風格地圖  
> 前端：`apps/web`，Next.js + TypeScript + Tailwind CSS  
> 後端：`apps/api`，FastAPI + Pydantic + CWA OpenData  
> 部署目標：前端上架 Vercel，後端建議部署 Render / Railway / Cloud Run

---

## 1. 專案定位

本專案目標是建立一套「農事天氣儀表板」，讓使用者可以依據縣市、行政區與作物，查看：

- 一週天氣預測
- 即時測站資料
- 降雨、溫度、風速等天氣圖層
- 農事風險提醒
- 農民白話化操作建議

核心資料來源以 **中央氣象署 CWA OpenData** 為主。  
地圖視覺化以 **Leaflet + OpenStreetMap** 作為 MVP 預設，Windy 僅作為進階可選 provider。

---

## 2. 架構決策

### 2.1 前後端分離

最終建議架構：

```text
Vercel
└── apps/web  Next.js 前端

Render / Railway / Cloud Run
└── apps/api  FastAPI 後端
```

原因：

- Vercel 很適合部署 Next.js 前端。
- FastAPI 後端放 Render / Railway / Cloud Run 較穩定。
- CWA API Key 不應該暴露在前端。
- 前端只呼叫自己的後端 API，不直接呼叫 CWA。

---

## 3. GitHub Repo 狀態

Repo：

```text
https://github.com/gshan1209-cell/scrape_weather
```

重要路徑：

```text
apps/web    # Next.js 前端
apps/api    # FastAPI 後端
README.md   # 專案說明
.env.example
```

Vercel 部署時，因為是 monorepo，必須設定：

```text
Root Directory = apps/web
```

若 Root Directory 設成 repo 根目錄，會因為根目錄沒有 `package.json` 而部署錯誤或出現 404。

---

## 4. 已建立 / 使用的 Issue

### Issue #1

```text
修正天氣地圖顯示：Leaflet fallback、Windy 載入診斷與空白畫面防護
```

目的：

- 避免 Windy 載入失敗時畫面永久空白。
- 預設使用 Leaflet + OpenStreetMap。
- Windy 只在有 provider 與 API key 時啟用。
- Windy 錯誤時自動 fallback 到 Leaflet。
- 補上 README 除錯說明。

---

## 5. 地圖功能修正紀錄

### 5.1 站點顯示問題

原問題：

- 測站點可能被天氣 overlay 蓋住。
- 測站若沒有溫度資料，可能不顯示。
- 切換地區後 marker / map state 需要同步更新。

修正方向：

- 新增 Leaflet pane：

```text
weatherOverlayPane   # 天氣 overlay
weatherStationPane   # 測站 marker
```

- 測站 pane 的 z-index 高於 overlay。
- 測站只要有合法經緯度就顯示。
- 沒有溫度資料時用灰色 marker。
- 點擊測站顯示 popup：
  - 測站名稱
  - 縣市 / 鄉鎮
  - 溫度
  - 濕度
  - 天氣
  - 雨量
  - 風速
  - 氣壓
  - 觀測時間
- 點擊測站時同步切換縣市 / 行政區。

相關 commit：

```text
bd418794e08a1a162c18e28ba0b7345a0a19dd78
Fix station layer rendering on weather map

7fc21df6ef0cfdf71dd66cb149c0e48731f0ad3f
Restore map overlays and strengthen Leaflet station rendering
```

---

### 5.2 Leaflet overlay 修正

原問題：

- 部分修正後，mock overlay 只剩區域點，降雨 / 溫度 / 風速圖層差異不足。

修正方向：

- 恢復三種 mock overlay：
  - `rain`：降雨圈層
  - `temperature`：溫度圈層
  - `wind`：風向 / 風速線條
- overlay 放入 `weatherOverlayPane`。
- 測站 marker 放入 `weatherStationPane`。
- 保留圖層切換、時間軸、圖例、農事提醒浮層。

---

### 5.3 OpenStreetMap tile error 防護

修正方向：

- 若 OSM 圖磚載入失敗，顯示錯誤提示。
- 避免使用者只看到空白地圖。

---

## 6. Windy fallback 修正紀錄

### 6.1 初始問題

`WindyMapClient.tsx` 原本只有在 script `onError` 或初始化 throw error 時 fallback。  
但以下情況可能仍會空白：

- Windy script 載入成功，但 `window.windyInit` 沒出現。
- Windy key 無效。
- Windy callback 沒回來。
- Windy 初始化卡住。

### 6.2 修正方向

新增：

- 8 秒初始化 timeout。
- 載入狀態文字：

```text
載入 Leaflet script
載入 Windy script
初始化 Windy
Windy map
Fallback Leaflet
```

- 失敗時切到：

```text
MapProviderFallback
```

- fallback 後顯示 Leaflet mock map。

相關 commit：

```text
4a181d3dc1fe455d88874e6236fcc3ea8d2197a6
Add Windy initialization timeout and fallback status
```

---

## 7. Vercel Build 錯誤與修正

### 7.1 錯誤內容

Vercel build 時出現：

```text
Type error: Subsequent property declarations must have the same type.
Property 'windyInit' must be of type ... but here has type ...
```

錯誤位置：

```text
components/map/WindyMapClient.tsx:28:5
```

### 7.2 原因

專案中已經存在另一份 `window.windyInit` 型別宣告。  
`WindyMapClient.tsx` 又新增了一次不同型別的 `declare global`，導致 TypeScript 宣告衝突。

### 7.3 修正方式

移除：

```ts
declare global {
  interface Window {
    windyInit?: ...
  }
}
```

改成在檔案內部使用安全轉型：

```ts
const windyInit = window.windyInit as WindyInit | undefined;
```

並將 `WindyInit` 型別調整成相容既有宣告：

```ts
type WindyInit = (
  options: Record<string, unknown>,
  callback: (windyAPI: WindyApi) => void,
) => void;
```

相關 commit：

```text
0490252c4a97d3624334b884a36423a9ee9305d0
Fix Windy window type conflict for Vercel build
```

---

## 8. README 更新內容

已補上「看不到地圖怎麼辦」章節，包含：

- 不需要搭配 Google Earth。
- MVP 預設使用 Leaflet + OpenStreetMap。
- `NEXT_PUBLIC_WEATHER_MAP_PROVIDER=mock`。
- Windy 啟用條件。
- Windy 失敗後 8 秒內 fallback。
- CWA API key 未設定時：
  - 一週預報仍會回 mock fallback。
  - `/weather/stations` 可能回空陣列。
  - 地圖仍保留 mock 區域點可操作。

相關 commit：

```text
a1de59707708b69bb1e6acb168db18645efab4c6
Document map troubleshooting steps
```

---

## 9. Vercel 部署設定

### 9.1 Project 設定

Vercel Project 應設定：

```text
Framework Preset: Next.js
Root Directory: apps/web
Install Command: npm install
Build Command: npm run build
Output Directory: 留空 / default
```

若出現：

```text
404: NOT_FOUND
Code: NOT_FOUND
```

優先檢查：

1. 是否打開了 Vercel 後台網址，而不是公開網站網址。
2. 是否使用最新 `Ready` deployment 的 `Visit`。
3. Root Directory 是否為 `apps/web`。
4. 是否重新 Redeploy 並清除 build cache。

---

### 9.2 Vercel 前端環境變數

Vercel 只放前端可見設定：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_WEATHER_MAP_PROVIDER=mock
NEXT_PUBLIC_WINDY_API_KEY=
NEXT_PUBLIC_WINDY_DEFAULT_LAT=23.6978
NEXT_PUBLIC_WINDY_DEFAULT_LON=120.9605
NEXT_PUBLIC_WINDY_DEFAULT_ZOOM=7
NEXT_PUBLIC_WINDY_DEFAULT_OVERLAY=rain
```

注意：

```text
CWA_API_KEY 不可以放在 Vercel 前端專案。
```

原因：

- `NEXT_PUBLIC_*` 會被打包到前端。
- 使用者可在瀏覽器看到。
- CWA API key 應該只存在後端。

---

## 10. 後端 FastAPI 設定

後端應部署到 Render / Railway / Cloud Run，並設定：

```env
CWA_API_KEY=your_cwa_api_key
CWA_WEEKLY_DATASET_ID=F-D0047-091
CWA_VERIFY_SSL=true
APP_ENV=production
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CACHE_TTL_MINUTES=180
ENABLE_WINDY_POINT_FORECAST=false
WINDY_POINT_FORECAST_API_KEY=
```

後端 API base URL 範例：

```text
https://scrape-weather-api.onrender.com/api/v1
```

Vercel 前端應設定：

```env
NEXT_PUBLIC_API_BASE_URL=https://scrape-weather-api.onrender.com/api/v1
```

---

## 11. CWA API 設定原則

正確架構：

```text
Vercel 前端
  ↓
NEXT_PUBLIC_API_BASE_URL
  ↓
FastAPI 後端
  ↓
CWA_API_KEY
  ↓
中央氣象署 OpenData
```

前端不直接呼叫 CWA。

後端會使用：

```text
CWA_API_KEY
CWA_WEEKLY_DATASET_ID
CWA_VERIFY_SSL
```

目前後端端點包含：

```text
GET /api/v1/health
GET /api/v1/locations
GET /api/v1/weather/weekly?city=臺北市&district=北投區
GET /api/v1/weather/stations
GET /api/v1/advisory/weekly?city=臺北市&district=北投區&crop=水稻
```

---

## 12. 本機 / CI 驗收指令

### 12.1 前端

```powershell
cd apps/web
npm install
npm run build
```

### 12.2 後端

```powershell
cd apps/api
pip install -r requirements.txt
pytest
```

若沒有測試檔導致 `no tests ran`，至少確認 API 可啟動：

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 13. 給 Codex 的最後驗收指令

```text
請協助驗收 gshan1209-cell/scrape_weather 專案。

重點：
1. 確認 apps/web 可在 Vercel build 成功。
2. 執行：
   cd apps/web
   npm install
   npm run build

3. 若 build 失敗，直接修正，不要只回報。
4. 確認 Root Directory 文件寫明 apps/web。
5. 確認 README 已說明 CWA_API_KEY 不可放前端。
6. 確認 WindyMapClient 不再重複宣告 Window.windyInit。
7. 確認 NEXT_PUBLIC_API_BASE_URL 使用後端 API 網址。
8. 確認地圖預設 provider 為 mock。
9. 確認 Windy 失敗會 fallback 到 Leaflet。
10. 若全部通過，回報可關閉 Issue #1。
```

---

## 14. 目前剩餘待辦

### 必做

- 重新觸發 Vercel Redeploy。
- 勾選 `Clear Build Cache and Redeploy`。
- 確認最新 build 是否通過。
- 確認公開網站 URL 是否可開啟。
- 部署 FastAPI 後端。
- 將後端網址填入 Vercel：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
```

- 後端設定：

```env
CORS_ORIGINS=https://your-vercel-domain.vercel.app
CWA_API_KEY=your_cwa_api_key
```

### 建議

- 新增 GitHub Actions CI：
  - `apps/web npm run build`
  - `apps/api pytest`
- 新增 `docs/deploy-vercel.md`。
- 新增 `docs/deploy-api.md`。
- 後續若要商用，將資料庫從 SQLite-ready 升級到 PostgreSQL / Supabase。

---

## 15. 最終判斷

目前專案方向正確：

```text
CWA OpenData 作為正式天氣資料來源
Leaflet + OpenStreetMap 作為 MVP 地圖
Windy 作為進階可選視覺化
FastAPI 保護 CWA_API_KEY
Vercel 專注部署 Next.js 前端
```

上線關鍵不在 Google Earth，也不是 Windy，而是：

```text
1. Vercel Root Directory = apps/web
2. 前端 NEXT_PUBLIC_API_BASE_URL 指向公開後端
3. 後端正確設定 CWA_API_KEY
4. 後端 CORS_ORIGINS 允許 Vercel 網址
5. npm run build 必須通過
```
