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

本 Repository 是已核准分類的 **L3 農事天氣產品**，以中央氣象署 CWA OpenData 為主要資料來源，包含：

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
- Shared `cwa_scraper` 目前 Main 為 `7656e4aaa9a05c3b1492a28fd1a78b167e56122b`；TLS/live validation 是 `AI-Workstream#242`，governance validation 是 `AI-Workstream#243` Revision 2。兩者皆 pending，不得表示為 PASS，也不得自動升級為 Production dependency。

## 5. 安全規則

- `CWA_API_KEY`、`WINDY_POINT_FORECAST_API_KEY` 只可存在後端 Runtime，不得進入 Browser、Git、Log、Context 或 Evidence。
- `NEXT_PUBLIC_WINDY_API_KEY` 是前端可見 Key，正式環境必須設定網域與用量限制。
- 正式環境應維持 `CWA_VERIFY_SSL=true`。
- 不得自動修改 CORS、Credential、Provider、Dataset、Production Deployment 或公開 URL。
- 不得以 Mock 成功取代 Live Integration Evidence。
- 不得自動 Merge、Release 或 Deployment。
- `CWA_VERIFY_SSL=false` 的現存開發模式由 Security Issue #4 獨立管理；本治理收斂不得順帶修改 TLS Policy。

## 6. Development / Validation Boundary

一個 Implementation/Fix Scope 使用一個 Branch 與一個正常 Repository-local PR。Primary Development Agent 負責實作、remediation 與可用的 Sandbox-first/focused validation；PR 自身 Merge Gate滿足後可合併 Main，Pending Supplemental Validation 不凍結 Main。

需要 Backend／Frontend／Browser／Live API／Deployment 等獨立驗證時，使用 AI-Workstream Post-Main Validation Task。Qualified independent validator 必須讀 execution-time latest Main、記錄 exact `testedMainSha`，只回傳 Evidence／Findings；不得 Repository Write、Remediation、建立 Branch／PR、Merge 或關閉 Source Issue。

Current exact authority：

```yaml
policy: DS-003@2.1.1
responsibility: RESP-DEV-AGENT-001@2.1.1
validationTaskProcedure: PROC-VALIDATION-TASK-001@2.1.1
codexProcedure: PROC-CODEX-POST-MAIN-VALIDATION-001@1.1.1
chatgptAuditProcedure: PROC-CHATGPT-AUDIT-001@2.1.1
issueClosureProcedure: PROC-ISSUE-CLOSURE-001@2.1.1
testPullRequest: null
validatorRepositoryWrite: false
validatorRemediation: false
validatorBranchCreation: false
validatorPullRequestCreation: false
validatorMerge: false
validatorSourceIssueClosure: false
pendingValidationFreezesMain: false
```

Known GitHub Actions account-level quota／billing／spending-limit pre-execution blocker 使用 `WAIVED_BY_OWNER / NOT_RUN`，不得主動 rerun 只為重現相同 blocker，也不得表示為 PASS。

## 7. 驗證入口

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

需要 CWA／Windy Key、瀏覽器、Vercel 或正式後端環境的驗證，只能在受控環境執行並提供去敏 Evidence；沒有必要環境時維持 `blocked/not-run`。

## 8. 人工核准邊界

以下操作需人工核准：

- 正式 Credential／Secret 變更。
- CWA Dataset、Weather Provider 或 TLS Policy 變更。
- Mock／Live 資料判定邏輯變更。
- Shared Adapter Production Adoption。
- CORS、正式 Domain、公開 API 或 Deployment 變更。
- Release 與正式資料發布。
