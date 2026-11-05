# Weather state fixes: local save status

Branch: `fix/weather-data-status`

Base commit: `275dd89f7ae36e6e4a2cf869da1fb84b635dce9d`

This record is saved with the completed local code and regression tests. It does not authorize a push, merge, deployment, or production unblock. The implementation plan records the original intended work; the verified results and remaining items below describe this saved snapshot.

Completed changes:

- Public pages reject absent, blank, or loopback API configuration without making a request to the visitor's computer. Local development retains its local API fallback. Requests time out after 15 seconds.
- City changes ignore late prior-city responses; refresh clears prior values while a new response is pending.
- Backend responses distinguish mock, live, stale, empty, unavailable, error, and unknown data; missing source time is not replaced with the current time. Missing cities never select another city's forecast.
- Views share the same state. Unknown or expired forecasts/advice cannot display a normal official risk or synchronized state. Mock provenance remains visible.
- Expired forecast dates are excluded; the today card selects the current date in Asia/Taipei. Station markers use the parent's resource and are cleared on refresh/error/expiry; individually expired or undated observations are excluded.
- Strict CWA TLS behavior and formal validation/production gates remain unchanged.

Last executed checks before this save:

| Check | Result |
| --- | --- |
| Frontend `npm test`, using existing task-local tools | 33 passed, 0 failed |
| New backend weather-state regressions | 12 passed |
| Complete repository/backend pytest | 22 passed, 1 pre-existing failure |
| In-memory React home integration, public API unconfigured | 0 fetch calls; both summaries, weather card, map advice, and station state are `config` |
| TypeScript/TSX syntax transpilation | 53 files, 0 syntax errors; not a full typecheck |
| Python syntax compilation in memory | 39 files, passed |
| `git diff --check` | Passed |

The pre-existing failure is `tests/test_governance_execution_policy.py::test_active_surfaces_do_not_publish_test_only_execution`, which rejects the historical/superseded `Test-only` text in the existing status snapshot. The backend environment also reports a Starlette TestClient deprecation warning. Neither result is represented as a passing complete suite.

Remaining limits and deferred items:

- Full Next.js lint, build, semantic typecheck, and post-fix real-browser validation were not run because disk space is low and the full app dependencies are not installed.
- No verified public backend endpoint was found. Production health, CORS, and credentialed live CWA integration remain NOT_RUN; no endpoint or service was invented.
- README's old preview link and AGENT.md's obsolete TLS prose remain unchanged and need a separate documentation cleanup.
- An independent read-only review identified four P2 edge cases and a per-station freshness concern. They were reproduced and fixed with regression tests; the revised snapshot was not independently re-reviewed.
- AI-Workstream #247/#242/#243, source issue closure, and production readiness/unblock remain unchanged.

Only source, dependency manifests, tests, the plan, and this status record belong in the save. Task-local virtual environments, package installations, browser profiles, screenshots, caches, logs, and synthetic certificate fixtures are outside the save. Candidate files were checked for generated/binary paths and common private-key/token/credential patterns; no hits were found. This limited scan is not a general security certification.

This save operation performs no installation, build, push, merge, or deployment. Test results above are the already executed evidence, not a claim that tests were rerun during the save.
