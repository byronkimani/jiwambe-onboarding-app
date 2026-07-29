# Implementation status — Jiwambe Onboarding

**Last updated:** 2026-07-29  
**Repository:** `jiwambe-onboarding-app`  
**Overview:** [`overview.md`](overview.md)  
**Plan:** [`implementation-plan.md`](implementation-plan.md)

Legend: **Shipped** | **Demo UI** | **Planned** | **Deferred**

---

## Phase progress (summary)

| Phase | Name | Status |
|-------|------|--------|
| 0 | Documentation and product SSOT | **Shipped** |
| 1 | Repository bootstrap | **Shipped** |
| 2 | Route realignment | **Shipped** |
| 3 | Agent auth (email + OTP) | **Demo UI** (prototype parity + MSW + Auth.js; upstream refresh TBD) |
| 4 | Tablet chrome | **Demo UI** (StepRail, NotifPanel dropdown, profile route, PWA install shell) |
| 5 | Desk worklist | **Demo UI** (kanban + kraft folders; `[id]` redirects to flow) |
| 6–8 | Capture wizard | **Demo UI** — stages in `capture-stage-body`; **create/PATCH/pause/submit/disqualify** via applications BFF + MSW; product/catalog, deposit STK/validate, bike inventory wired; E2E `capture-journey.spec.ts` (mobile) |
| 9 | Agreement and release | **Demo UI** (viewer, PDI, OTP, summary timeline) |
| 10–11 | API integration, hardening | **Planned** |

---

## Auth

| Surface | Status | Notes |
|---------|--------|-------|
| Email + OTP login | **Demo UI** | Prototype `auth.js` on `/` |
| Route gate (`proxy.ts`) | **Shipped** | Protects `/desk`, `/capture`, BFF |
| Demo officer | **Shipped** | Email `john@jiwambe.com`, password `demo12345`, OTP `123456` |

---

## Routes (Next.js `src/app`)

| Route | UI | Data |
|-------|-----|------|
| `/` | **Demo UI** | Login |
| `/desk`, `/desk/history`, `/desk/drafts`, `/desk/profile` | **Demo UI** | Queue list excludes drafts/history by default; `scope=history` / `lifecycleState` for other modes |
| `/desk/applications/[id]` | **Shipped** | Redirect to primary flow route |
| `/desk/applications/[id]/agreement` … `release`, `summary` | **Demo UI** | Fixture flows |
| `/capture/[stage]` | **Demo UI** | Wizard POST create + per-stage PATCH; **Pause** → draft PATCH + `POST …/pause`; **Resume** → `GET …/:id` hydrate + `?application=` on capture URLs |
| `/offline`, `/account-blocked`, `not-found` | **Demo UI** | Rider-style offline; agent support contacts |
| `GET /api/onboarding/health` | **Shipped** | `{ ok: true }` |
| `GET /api/onboarding/catalog/quotes` | **Demo UI** | Pre-seeded quote table |
| `GET /api/onboarding/catalog/products` | **Demo UI** | MSW + BFF; product stage grid |
| `POST /api/onboarding/deposits/stk` · `…/validate` | **Demo UI** | MSW STK + M-Pesa code fallback; updates `financing.depositPayment` |
| `GET /api/onboarding/inventory` | **Demo UI** | Items + upstream-style `rules` (hold minutes, assignable statuses) |

---

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| UX prototype in repo | **Shipped** | `docs/prototype/` |
| MSW onboarding auth | **Shipped** | `/onboarding/auth/*` (officer login, OTP, activate) |
| Applications BFF (list/create/PATCH/lookup/current/pause/submit/disqualify) | **Demo UI** | MSW store + Zod; capture wizard persists drafts; resume hydrates from GET |
| Inventory BFF (`GET /inventory`) | **Demo UI** | MSW read-only stock + rules; bike stage loads via BFF |
| Catalog products + deposit STK | **Demo UI** | BFF + MSW; capture product stage |
| Playwright capture journey | **Shipped** | `e2e/capture-journey.spec.ts` + `e2e/helpers/capture.ts` (mobile-chrome); catalog/STK API checks; full submit → desk queue |
| Worklist list filter (MSW) | **Shipped** | Default queue excludes DRAFT/PAUSED/DISQUALIFIED/ACTIVE_LOAN; `scope=history`; desk modes fetch matching query |
| Deposit / catalog schemas + contracts | **Shipped** | `deposit-schemas`, `catalog-schemas`; [`onboarding-deposits-api-contract.md`](onboarding-deposits-api-contract.md) |
| Real upstream API | **Planned** | `MOCK_JIWAMBE_API=0` against staging |
| File upload / OCR / face | **Planned** | UI placeholders only |
| Offline sync queue | **Planned** | TopBar online toggle + queued badge stub |
| PWA install prompt | **Demo UI** | `beforeinstallprompt` sheet + dismiss storage |
| Kiswahili | **Deferred** | English-only v1 |
