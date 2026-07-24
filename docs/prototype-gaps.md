# Prototype gaps — Jiwambe Onboarding

**Status:** Active catalog  
**Prototype:** [`prototype/`](prototype/) (split HTML + `js/*`)  
**Last updated:** 2026-07-24

Items below must be resolved or explicitly accepted before calling a phase **Done** in production code.

---

## Auth and identity

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| Login identifier | Email + OTP in [`js/auth.js`](prototype/js/auth.js) | **Phone + password** per [`overview.md`](overview.md) |
| Agent directory | Hard-coded “Jane Ochieng” | API-backed officer profile and dealership |

---

## Pricing and payments

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| Daily installment | `calcDaily()` in [`js/data.js`](prototype/js/data.js) / capture | **API quote only** — display BFF response |
| Min deposit | `MIN_DEPOSIT` / `minDeposit()` client map | API rules by operating model |
| STK / M-Pesa code | Simulated timeouts and confirm | Server validation only; UI shows BFF status |
| Product catalog prices | Static `PRODUCTS` array | `GET` catalog from BFF |

---

## AI and document checks

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| ID OCR diff panel | Simulated delay + fake fields | Upstream OCR service via BFF |
| Face match % | Random/simulated scores | Provider API; thresholds from ops policy |
| Pre-submit anomaly scan | Fixed rule list after timeout | Server-side rules engine |

---

## Lifecycle and data

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| Worklist seed data | `seedApps` / `seedInventory` in `data.js` | Live APIs; dealership-scoped stock |
| Demo advance buttons | `demoAdvance()` on worklist | Removed; ops drives state in back-office |
| Rejected / suspended | Not modeled | Confirm with product + API |
| LMS / insurance steps | Implied between states | Explicit webhooks or polling — TBD with backend |

---

## Repository vs prototype

| Gap | Notes |
|-----|--------|
| Next.js routes | `src/app` still has **rider PWA** shells (`/owner/*`, `/apply`) — **Phase 2** replaces with `/desk`, `/capture/*` |
| API namespace | BFF uses `/api/onboarding/*`; align handlers with API contract as endpoints ship |
| [`portal-migration.md`](portal-migration.md) | Documents **rider app**, not onboarding — do not use for this product |

---

## UX deferred

| Item | Decision |
|------|----------|
| Kiswahili | **Deferred** — English-only v1 |
| Tablet Playwright viewport | Mobile 390×844 in CI today; optional wider viewport in Phase 4 |
| PWA install prompts | Follow agents-app pattern when desk ships |

---

## When closing a gap

1. Update this file (mark resolved or move to “Accepted”).
2. Update [`implementation-status.md`](implementation-status.md).
3. If behavior changes, sync [`overview.md`](overview.md) §8.
