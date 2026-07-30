# Implementation status

**Last updated:** 2026-07-30  
**API:** [`api-contract.md`](api-contract.md) · OpenAPI [`api-contract.openapi.yaml`](api-contract.openapi.yaml)

Legend: **Shipped** · **Demo UI** · **Planned** · **Deferred**

## Summary

| Area | Status |
|------|--------|
| Docs, repo bootstrap, routes | **Shipped** |
| Agent auth (email + OTP) | **Demo UI** — MSW + Auth.js; upstream refresh in jwt callback |
| Desk worklist (board/list, folders) | **Demo UI** |
| Capture wizard (10 stages) | **Demo UI** — BFF create/PATCH/pause/submit/disqualify |
| Catalog, quotes, pricing-rules | **Demo UI** — ecosystem `/catalog/*` BFF + MSW |
| Customers search | **Demo UI** — `/customers/search` |
| Inventory | **Demo UI** — `/inventory` |
| Payments (STK + validate) | **Demo UI** — `/payments/*` |
| Agreement / release flows | **Demo UI** — fixture UI only |
| Document upload / OCR / face | **Planned** |
| Real upstream (`MOCK_JIWAMBE_API=0`) | **Planned** |
| `/offline` static page | **Shipped** — connection message only (no sync queue) |
| Kiswahili | **Deferred** |

Repo dead-code cleanup (2026-07-30): removed orphan components/libs, empty legacy API dirs, and unused quote fixtures.

## BFF routes (current)

| BFF | Purpose |
|-----|---------|
| `/api/onboarding/auth/*`, `/api/onboarding/logout` | Officer login, activate, password reset |
| `/api/onboarding/applications/*` | Application CRUD + lifecycle |
| `/api/customers/search` | Lead lookup |
| `/api/catalog/products` | Product grid |
| `/api/catalog/pricing-rules` | Readiness min deposits |
| `/api/catalog/quotes` | Financing calculator |
| `/api/inventory` | Bike stock + rules |
| `/api/payments/stk`, `/api/payments/validate` | Deposit verification |

Full upstream mapping and MSW coverage: [`api-contract.md`](api-contract.md#bff--upstream-map).

## Tests

- Unit: `pnpm test --run` (BFF routes, schemas, MSW store)
- E2E: `pnpm test:e2e` — mobile 390×844; `capture-journey.spec.ts` full submit → desk

## Demo credentials

`john@jiwambe.com` / `demo12345` → OTP `123456`
