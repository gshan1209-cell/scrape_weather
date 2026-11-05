# Weather state fixes implementation plan

> Execute inline with test-driven-development. The parent explicitly authorized local remediation on 2026-11-05; do not treat this as formal #247 execution.

**Goal:** Preserve the weather dashboard design while preventing localhost requests on a public site and misleading success/freshness/location/error states.

**Architecture:** Keep Next.js/FastAPI and existing providers. Add explicit backend data status/reason/time metadata and a shared frontend presentation function. Reject unconfigured public API access before fetch; local development may retain loopback. Ignore obsolete request completions when location changes. Preserve strict TLS and explicit mock labels.

**Tech stack:** Existing Python/FastAPI/Pydantic/httpx; React/TypeScript; pytest and Node's built-in test runner. No production service or dependency adoption.

**Spec:** Parent dispatch in this conversation; evidence/VALIDATION-REPORT.txt outside the repo records the reproduced defects.

## Global constraints

- Local candidate branch only; no production configuration, deployment, merge, push, permissions, schedules or new paid service.
- No secrets or real user data. Synthetic provider fixtures only.
- Disk is low: no full npm install/build. A bounded task-local install of existing compiler/React test packages is allowed only while free C: remains above 1 GiB.
- Do not mark #247, #242 or #243 complete or unblock production.
- Backend absence is unknown: no public API was found in repository docs, deployed client, available Vercel projects or visible user history. Do not invent an endpoint.
- Default freshness threshold uses existing 180-minute CACHE_TTL_MINUTES. Unknown source time remains unknown, never current time.

## Review focus

- Public API config is absent, blank or points at loopback; no request reaches the visitor's computer.
- Old response from a previous city or an in-progress refresh cannot present itself as current synchronized data.
- Forecast has no requested city, no days, expired dates or absent/invalid publication time; no false normal or synchronized label.
- TLS/upstream/no-key station failures expose only sanitized status/reason and no invented observation timestamp.
- Pending fetch times out, and rejected/empty advice is distinguished from loading in both normal and map views.

## Task 1: Add regression tests and truthful backend metadata

Files: apps/api/app/schemas/weather.py, schemas/advisory.py, services/weather_service.py, api/v1/advisory.py; apps/api/tests/test_weather_states.py.

Interfaces: WeeklyWeatherResponse and StationsResponse gain dataStatus/reason, nullable source timestamp; advisory response carries source/status/reason. Matching city is mandatory. Raw source timestamps are preserved. Station failure returns error/unavailable metadata without leaking an exception.

- [ ] Write failing pytest cases for missing city, unknown time, expired forecast, station TLS failure, no-key and healthy/empty station datasets; advisory must not calculate normal risk from missing/stale data.
- [ ] Run tests against baseline and confirm behavioral failures.
- [ ] Implement minimal schema/service/route changes; preserve real CWA/mock provenance and strict TLS.
- [ ] Run new tests and full backend suite; report pre-existing governance failure separately.

## Task 2: Guard frontend API access and normalize state

Files: apps/web/lib/api-client.ts, lib/weather-state.ts, features/weather/types.ts, features/advisory/types.ts, features/weather/hooks.ts and other request hooks; apps/web/tests/*.test.cjs and test loader.

Interfaces: apiGet rejects missing/unsafe public configuration and times out after 15 seconds. A data-state helper maps loading/error/status/source/date into explicit display state. A shared request hook clears previous-city data and ignores late promises.

- [ ] Write failing actual-module Node tests for absent/blank/public loopback config, valid HTTPS configuration, local development, HTTP failure and abort timeout.
- [ ] Write failing state tests for stale/unknown/empty/error/mock/fresh data and timestamp formatting with Asia/Taipei year/timezone.
- [ ] Implement guard, timeout, state helper and request lifecycle; no new production runtime dependency.
- [ ] Run Node tests and source syntax checks.

## Task 3: Wire existing views and finish evidence

Files: app/page.tsx, SummarySidebar.tsx, CurrentWeatherCard.tsx, FarmerAdviceCard.tsx, MapFloatingAdvice.tsx and map prop forwarding; README.md and AGENT.md for related obsolete guidance.

Interfaces: All weather/advice views consume the same presentation state. Suppress normal risk and stale advisory values when weather is empty/stale/unknown/error. Show explicit station status and source timestamp. Map provider fallback carries the same advice state.

- [ ] Write failing SSR component tests for no configuration, stale/empty data, station failure and map advice rejected/pending states; preserve explicit mock labels.
- [ ] Make minimal view/prop changes without redesign.
- [ ] Correct README demo URL and obsolete TLS handoff guidance only.
- [ ] Run all Node/pytest checks, inspect the diff and request a whole-branch review under the executing-plans skill; resolve important findings with regression tests.
- [ ] Save exact candidate diff/evidence and local commit(s), update original Trello card, report remaining NOT_RUN items. Do not push or deploy.

## Execution ledger

Ruling: The explicit parent follow-up authorizes a local remediation branch; #247 remains untouched as a separate read-only formal validation task.
Ruling: No verified public backend endpoint was found. Show not configured; do not create a service or point at a documentation example.
Ruling: Use a 15-second frontend timeout and existing 180-minute freshness threshold. These are implementation choices; preserve timestamps and show unknown freshness when evidence is missing.
Pre-flight: Task 1 produces dataStatus/reason/nullable updatedAt consumed by Tasks 2/3; older payloads must default to unknown rather than live.
Pre-flight: Task 2 produces a single presentation state consumed by all Task 3 advice/summary/map views.
