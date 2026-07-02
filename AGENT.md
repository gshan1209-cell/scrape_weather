# AGENT.md

本文件提供後續 agent 接手 `scrape_weather` 專案時的交接資訊。請先閱讀此檔，再閱讀 `README.md`、`docs/architecture.md`、`docs/api-contract.md`。

## 專案概況

這是一個 CWA OpenData 農事天氣 MVP：

- `apps/api`：FastAPI 後端，提供健康檢查、地點、一週天氣、農事提醒 API。
- `apps/web`：Next.js + TypeScript + Tailwind 前端，包含 Leaflet + OpenStreetMap 台灣地圖、mock 天氣 overlay、左側摘要欄、農事提醒。
- 預設資料來源會嘗試讀取 CWA OpenData；若 CWA key 不存在、連線失敗或解析不到資料，會 fallback 到 mock weather data。
- 天氣地圖目前不是 CWA 真實雷達/雨量圖層，而是 Leaflet OSM base map + mock overlay。

## 重要安全提醒

- 不要輸出、提交或記錄 `.env` 裡的 `CWA_API_KEY`。
- `.env` 已被 `.gitignore` 排除。
- `CWA_VERIFY_SSL=false` 只適合本機開發 workaround；正式環境請維持 `true`，並處理系統 CA/憑證信任問題。
- Windy key 若未來啟用，`NEXT_PUBLIC_WINDY_API_KEY` 是前端可見金鑰，正式環境需做 domain restriction 和 usage limit。

## 目前已知狀態

截至最新交接更新時：

- 後端可讀到 `.env` 中的 `CWA_API_KEY`。
- 本機測試 CWA 連線時曾遇到 Python SSL 錯誤：
  - `CERTIFICATE_VERIFY_FAILED: Missing Subject Key Identifier`
- 因此新增了 `CWA_VERIFY_SSL` 設定：
  - 預設 `true`
  - 若本機測試需要可在 `.env` 加 `CWA_VERIFY_SSL=false`
- 使用者已在 `.env` 加上 `CWA_VERIFY_SSL=false` 後，CWA live request 已成功回 `200`。
- `apps/api/app/services/weather_service.py` 已修正 parser，可支援 CWA `F-D0047-091` 的實際大寫 JSON 結構：
  - `records.Locations[].Location[].WeatherElement[]`
  - `ElementName`
  - `Time`
  - `ElementValue`
- `/api/v1/weather/weekly?city=臺北市&district=北投區` 已確認回傳 `source: "CWA OpenData"`。
- 最近驗證：
  - `apps/api`: `pytest` 通過，4 tests passed
  - `apps/web`: `npm run lint` 通過
  - `apps/web`: `npm run build` 通過，若 dev server 佔用 `.next`，可用 `NEXT_DIST_DIR=.next-verify` 驗證

## 啟動方式

### API

```powershell
cd D:\SeanLin\hw10-openData\scrape_weather\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

若 `.venv` 不存在：

```powershell
cd D:\SeanLin\hw10-openData\scrape_weather\apps\api
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Web

```powershell
cd D:\SeanLin\hw10-openData\scrape_weather\apps\web
npm install
npm run dev
```

URLs:

- Web: `http://localhost:3000`
- API health: `http://127.0.0.1:8000/api/v1/health`
- API docs: `http://127.0.0.1:8000/docs`

## 驗證指令

### API tests

```powershell
cd D:\SeanLin\hw10-openData\scrape_weather\apps\api
.\.venv\Scripts\python.exe -m pytest
```

### Web lint/build

```powershell
cd D:\SeanLin\hw10-openData\scrape_weather\apps\web
npm run lint
npm run build
```

如果現有 Next dev server 正在使用 `.next`，build 可能因 `.next/trace` 被鎖住而失敗。可改用：

```powershell
$env:NEXT_DIST_DIR='.next-verify'
npm run build
```

驗證後可刪除：

```powershell
Remove-Item -LiteralPath .\.next-verify -Recurse -Force
```

## 主要檔案導覽

### API

- `apps/api/app/main.py`：FastAPI app 與 CORS 設定。
- `apps/api/app/core/config.py`：環境變數設定，包含 `CWA_API_KEY`、`CWA_WEEKLY_DATASET_ID`、`CWA_VERIFY_SSL`。
- `apps/api/app/services/cwa_client.py`：CWA OpenData client。
- `apps/api/app/services/weather_service.py`：CWA normalization 與 mock fallback。
- `apps/api/app/services/advisory_service.py`：農事提醒規則。
- `apps/api/app/repositories/location_repository.py`：MVP hardcoded 中文地點。
- `apps/api/app/services/windy_client.py`：預留 Windy Point Forecast skeleton，MVP 未啟用。

### Web

- `apps/web/app/page.tsx`：首頁主頁，左側摘要欄 + 右側主內容。
- `apps/web/components/layout/SummarySidebar.tsx`：左側摘要欄，顯示風險、地區、作物、API 狀態、地圖模式、資料來源。
- `apps/web/components/map/WeatherMapShell.tsx`：決定使用 Leaflet mock map 或 Windy provider。
- `apps/web/components/map/LeafletWeatherMap.tsx`：Leaflet + OpenStreetMap 台灣地圖與 mock weather overlay。
- `apps/web/components/map/WindyMapClient.tsx`：預留 Windy Map Forecast client-only skeleton，失敗 fallback Leaflet。
- `apps/web/features/system/*`：前端 health check hook。
- `apps/web/features/weather-map/*`：地圖設定、圖層選項、地圖 state。

## API 合約

Base path: `/api/v1`

- `GET /health`
- `GET /locations`
- `GET /weather/weekly?city=臺北市&district=北投區`
- `GET /advisory/weekly?city=臺北市&district=北投區&crop=水稻`

資料來源判斷：

- `source === "CWA OpenData"`：真實 CWA 資料
- `source === "模擬天氣資料"`：fallback/mock 資料

## 後續建議任務

1. **補強 CWA parser 測試**
   - 目前已能解析 live `F-D0047-091`。
   - 建議保存一份去識別化 fixture，新增 parser tests，避免 CWA JSON 結構調整時無聲 fallback。

2. **加上 CWA 連線診斷 endpoint**
   - 例如 `GET /api/v1/diagnostics/cwa`
   - 只回傳是否可連線、dataset、HTTP status、資料筆數，不回傳 key。

3. **改善 SSL 處理**
   - 優先找出本機 Python/CA 為何不信任 CWA 憑證。
   - 避免長期依賴 `CWA_VERIFY_SSL=false`。

4. **前端錯誤狀態更細**
   - 區分 API 離線、CWA fallback、資料解析失敗。
   - 左側摘要欄可顯示「目前使用模擬資料」警示。

5. **地圖 overlay 真實化**
   - 目前 overlay 是 mock。
   - 可考慮 CWA 雨量、雷達或警特報資料，再疊到 Leaflet。

6. **測試擴充**
   - API：CWA parser fixture tests、CWA client error tests。
   - Web：核心元件 render tests 或 Playwright screenshot smoke test。

## 注意事項

- 目前 repo 可能存在未提交變更。修改前先看 `git status --short`。
- 不要 revert 使用者或其他 agent 的變更，除非明確要求。
- README 在某些 PowerShell 編碼環境可能顯示亂碼；若要處理，請確認檔案實際 UTF-8 編碼與終端 code page，不要盲目重寫所有內容。
- 目前 `NEXT_DIST_DIR=.next-verify` 已加入 `.gitignore`，可用於 build 驗證。
