# Implementation status

**Last updated:** 2026-07-31  
**API:** [`api-contract.md`](api-contract.md) · OpenAPI [`api-contract.openapi.yaml`](api-contract.openapi.yaml)

Legend: **Shipped** · **Demo UI** · **Planned** · **Deferred**

## Summary

| Area | Status |
|------|--------|
| Docs, repo bootstrap, routes | **Shipped** |
| Agent auth (email + OTP) | **Demo UI** — MSW + Auth.js; refresh tested in jwt callback |
| Officer profile BFF | **Demo UI** — `GET /v1/field/auth/me` + chrome fetch |
| Desk worklist (board/list, folders) | **Demo UI** — 60s poll + focus refresh |
| Capture wizard (10 stages) | **Demo UI** — prototype-faithful sub-flows (COGC/DL exits, STAGE/FLEET/DELIVERY/PERSONAL, lookup API, review checklist) |
| Document upload (capture) | **Demo UI** — init/complete BFF + MSW; identity, DL, COGC, model docs (conditional); PDF/HEIC; eager upload + retry + leave guard |
| Catalog, quotes, pricing-rules | **Demo UI** — `/v1/field/products*` BFF + MSW |
| Customers search | **Demo UI** — `/v1/field/customers/search` |
| Inventory | **Demo UI** — `/v1/field/bikes/assignable` |
| Payments (STK + validate) | **Demo UI** — `/v1/field/payments/*` |
| Agreement / release flows | **Demo UI** — BFF agreement/release/OTP + handover upload; demo signature/OTP until upstream |
| Submit BFF pre-check | **Shipped** — `blockingIssuesForSubmit` before upstream proxy |
| OCR / face match / anomaly scan | **Deferred (Phase D)** — placeholders until upstream APIs |
| BFF edge rate limits (Upstash Redis) | **Deferred (Phase D)** — see implementation plan |
| Real upstream (`MOCK_JIWAMBE_API=0`) | **Planned** — BFF pre-check + ceremony routes ready |
| Dealership locations & working context | **Planned** — [`dealership-working-context-plan.md`](dealership-working-context-plan.md) |
| Security headers (CSP, Permissions-Policy) | **Shipped** |
| CI dependency audit (`pnpm audit --audit-level=high`) | **Shipped** |
| Client `bffFetch` 401 session recovery | **Shipped** — [`bff-fetch.ts`](../src/lib/global/client/bff-fetch.ts) |
| Change password (signed-in profile) | **Demo UI** — `POST /api/onboarding/auth/password/change` + profile form; sign-out on success |
| Sentry observability | **Shipped** — client/server/edge, tunnel `/monitoring`, replay-on-error, user context |
| Structured server logging | **Shipped** — JSON stdout, `upstream_call` / `bff_request`; `X-Request-ID` correlation |
| Upstream `X-Request-ID` correlation | **Shipped** — sanitized forward + echo per upstream doc 01 §18 |
| Enhanced health / uptime | **Shipped** — `GET /api/onboarding/health` with readiness checks; 503 when degraded |
| Datadog / Grafana (logs + metrics) | **Planned (Phase 12)** — see [`implementation-plan.md`](implementation-plan.md) |
| Session logging (officer timeline) | **Planned (Phase 12)** — `officerId` + optional `sessionTraceId` on logs; see implementation plan |
| CSP production tightening (env split) | **Planned** — same pipeline |
| CSP nonces (drop `'unsafe-inline'`) | **Planned** — same pipeline; after env split |
| `/offline` static page | **Shipped** — connection message only (no sync queue) |
| Kiswahili | **Deferred** |

## BFF routes (current)

| BFF | Purpose |
|-----|---------|
| `/api/onboarding/auth/*` | Officer login, activate, password reset/change (demo MSW: `/v1/_demo/auth/*`) |
| `/v1/field/auth/me`, `/v1/field/auth/logout` | Profile + sign-out |
| `/v1/field/applications/*` | Application CRUD + lifecycle + documents + agreement/release |
| `/v1/field/customers/search` | Lead lookup (mock extension) |
| `/v1/field/products`, `/v1/field/products/quote`, `/v1/field/products/pricing-rules` | Catalog + calculator |
| `/v1/field/bikes/assignable` | Bike stock + rules |
| `/v1/field/payments/stk`, `/v1/field/payments/validate` | Deposit verification |

Full upstream mapping and MSW coverage: [`api-contract.md`](api-contract.md#bff--upstream-map).

## Tests

- Unit: `pnpm test --run` (BFF routes, schemas, MSW store, token refresh, Sentry options, structured logging, health checks)
- E2E: `pnpm test:e2e` — mobile 390×844; `capture-journey.spec.ts` full submit → desk

## Demo credentials

`john@jiwambe.com` / `demo12345` → OTP `123456` (MSW only)
