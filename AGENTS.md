# Scrape Weather｜Agent Entry

## 1. 啟動順序

執行任何開發、除錯或驗證前，依序閱讀：

1. `README.md`
2. `docs/scrape_weather_development_summary.md`
3. `.ai-company/repo-manifest.yaml`
4. `.ai-company/dual-interface.yaml`
5. `.ai-company/agent-context.yaml`
6. 與任務相關的 `apps/api`、`apps/web` 與測試

## 2. 系統定位

本 Repository 是以中央氣象署 CWA OpenData 為主要資料來源的農事天氣 MVP，包含：

- Next.js 農事天氣儀表板。
- FastAPI 天氣與農事提醒 API。
- Leaflet＋OpenStreetMap 預設地圖。
- Windy 可選 Provider 與 Leaflet Fallback。
- CWA Key 不可用時的 Mock Fallback。

本系統是天氣資料的應用與 Projection，不是官方氣象 Canonical Owner。

## 3. Human／Agent 雙入口

### Human Entry

- `apps/web`
- `README.md`
- `docs/scrape_weather_development_summary.md`

### Agent Entry

- `AGENTS.md`
- `.ai-company/agent-context.yaml`

兩個入口必須引用相同的 CWA Source、Mock／Live 狀態、Map Provider、Freshness、Deployment 與驗證 Evidence。

## 4. 狀態誠信

- Live CWA 與 Mock Fallback 必須能明確區分。
- CWA Key 缺失時，不得把 Mock 資料描述為即時官方資料。
- `/weather/stations` 回空陣列時，必須保留原因與資料狀態。
- Windy 失敗後切回 Leaflet 時，必須顯示 Fallback 狀態，不得靜默降級。
- README／開發報告中的完成描述不等於目前 Head 已重新驗證。
- 未執行 Backend、Frontend Build、Browser、Live CWA 或 Deployment 驗證時，狀態保持 `not-run`。

## 5. 安全規則

- `CWA_API_KEY`、`WINDY_POINT_FORECAST_API_KEY` 只可存在後端 Runtime，不得進入 Browser、Git、Log、Context 或 Evidence。
- `NEXT_PUBLIC_WINDY_API_KEY` 是前端可見 Key，正式環境必須設定網域與用量限制。
- 正式環境應維持 `CWA_VERIFY_SSL=true`。
- 不得自動修改 CORS、Credential、Provider、Dataset、Production Deployment 或公開 URL。
- 不得以 Mock 成功取代 Live Integration Evidence。
- 不得自動 Merge、Release 或 Deployment。

## 6. 驗證入口

Backend：

```bash
cd apps/api
pytest
```

Frontend：

```bash
cd apps/web
npm run lint
npm run build
```

需要 CWA／Windy Key、瀏覽器、Vercel 或正式後端環境的驗證，應在受控環境執行並提供去敏 Evidence。

## 7. 人工核准邊界

以下操作需人工核准：

- 正式 Credential／Secret 變更。
- CWA Dataset、Weather Provider 或 TLS Policy 變更。
- Mock／Live 資料判定邏輯變更。
- CORS、正式 Domain、公開 API 或 Deployment 變更。
- Release 與正式資料發布。
