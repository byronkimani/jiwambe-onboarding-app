# Implementation status

**Last updated:** 2026-07-30  
**API:** [`api-contract.md`](api-contract.md) · OpenAPI [`api-contract.openapi.yaml`](api-contract.openapi.yaml)

Legend: **Shipped** · **Demo UI** · **Planned** · **Deferred**

## Summary

| Area | Status |
|------|--------|
| Docs, repo bootstrap, routes | **Shipped** |
| Agent auth (email + OTP) | **Demo UI** — MSW + Auth.js; refresh tested in jwt callback |
| Officer profile BFF | **Demo UI** — `GET /api/onboarding/agents/profile` + chrome fetch |
| Desk worklist (board/list, folders) | **Demo UI** — 60s poll + focus refresh |
| Capture wizard (10 stages) | **Demo UI** — prototype-faithful sub-flows (COGC/DL exits, STAGE/FLEET/DELIVERY/PERSONAL, lookup API, review checklist) |
| Document upload (capture) | **Demo UI** — init/complete BFF + MSW; identity, DL, COGC, model docs (conditional); PDF/HEIC; eager upload + retry + leave guard |
| Catalog, quotes, pricing-rules | **Demo UI** — ecosystem `/catalog/*` BFF + MSW |
| Customers search | **Demo UI** — `/customers/search` |
| Inventory | **Demo UI** — `/inventory` |
| Payments (STK + validate) | **Demo UI** — `/payments/*` |
| Agreement / release flows | **Demo UI** — BFF agreement/release/OTP + handover upload; demo signature/OTP until upstream |
| Submit BFF pre-check | **Shipped** — `blockingIssuesForSubmit` before upstream proxy |
| OCR / face match / anomaly scan | **Deferred (Phase D)** — placeholders until upstream APIs |
| BFF edge rate limits (Upstash Redis) | **Deferred (Phase D)** — see implementation plan |
| Real upstream (`MOCK_JIWAMBE_API=0`) | **Planned** — BFF pre-check + ceremony routes ready |
| Security headers (CSP, Permissions-Policy) | **Shipped** |
| CI dependency audit (`pnpm audit --audit-level=high`) | **Shipped** |
| Client `bffFetch` 401 session recovery | **Shipped** — [`bff-fetch.ts`](../src/lib/global/client/bff-fetch.ts) |
| CSP production tightening (env split) | **Planned** — same pipeline |
| CSP nonces (drop `'unsafe-inline'`) | **Planned** — same pipeline; after env split |
| `/offline` static page | **Shipped** — connection message only (no sync queue) |
| Kiswahili | **Deferred** |

## BFF routes (current)

| BFF | Purpose |
|-----|---------|
| `/api/onboarding/auth/*`, `/api/onboarding/logout` | Officer login, activate, password reset |
| `/api/onboarding/agents/profile` | Officer chrome profile |
| `/api/onboarding/applications/*` | Application CRUD + lifecycle + documents + agreement/release |
| `/api/customers/search` | Lead lookup |
| `/api/catalog/products` | Product grid |
| `/api/catalog/pricing-rules` | Readiness min deposits |
| `/api/catalog/quotes` | Financing calculator |
| `/api/inventory` | Bike stock + rules |
| `/api/payments/stk`, `/api/payments/validate` | Deposit verification |

Full upstream mapping and MSW coverage: [`api-contract.md`](api-contract.md#bff--upstream-map).

## Tests

- Unit: `pnpm test --run` (BFF routes, schemas, MSW store, token refresh)
- E2E: `pnpm test:e2e` — mobile 390×844; `capture-journey.spec.ts` full submit → desk

## Demo credentials

`john@jiwambe.com` / `demo12345` → OTP `123456` (MSW only)
