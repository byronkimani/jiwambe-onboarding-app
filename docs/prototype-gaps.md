# Prototype gaps — Jiwambe Onboarding

**Status:** Active catalog  
**Prototype:** [`prototype/`](prototype/) (split HTML + `js/*`)  
**Last updated:** 2026-07-29

Items below must be resolved or explicitly accepted before calling a phase **Done** in production code.

---

## Screen matrix (prototype → Next.js)

| Prototype (`js/*`) | Next.js component / route | Status |
|--------------------|---------------------------|--------|
| `LoginScreen`, `OtpScreen` | [`officer-login-step.tsx`](../src/components/auth/officer-login-step.tsx), [`officer-otp-step.tsx`](../src/components/auth/officer-otp-step.tsx) | **Done** |
| `ProfileView` | [`profile-sheet.tsx`](../src/components/onboarding/chrome/profile-sheet.tsx), [`/desk/profile`](../src/app/desk/profile/page.tsx) | **Done** |
| `Worklist`, `AppFolder` | [`desk-worklist-screen.tsx`](../src/components/onboarding/desk/desk-worklist-screen.tsx), [`application-folder-card.tsx`](../src/components/onboarding/desk/application-folder-card.tsx) | **Done** |
| `HistoryScreen`, `DraftsScreen` | `desk-worklist-screen` modes | **Done** |
| `AgreementFlow` | [`agreement-flow.tsx`](../src/components/onboarding/flows/agreement-flow.tsx) | **Done** (demo steps) |
| `ReleaseFlow` | [`release-flow.tsx`](../src/components/onboarding/flows/release-flow.tsx) | **Done** (demo steps) |
| `SummaryFlow` | [`summary-flow.tsx`](../src/components/onboarding/flows/summary-flow.tsx) | **Done** |
| `ReadinessScreen` … `ReviewScreen` | [`capture-stage-body.tsx`](../src/components/onboarding/capture/stages/capture-stage-body.tsx) | **Done** (demo UI; not 1:1 LOC split) |
| `TopBar`, `NotifPanel`, `StepRail`, `StageShell` | [`top-bar.tsx`](../src/components/onboarding/chrome/top-bar.tsx), [`notif-panel.tsx`](../src/components/onboarding/chrome/notif-panel.tsx), capture chrome | **Done** |

---

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| Login identifier | Email + OTP in [`js/auth.js`](prototype/js/auth.js) | **Closed in Next.js UI** — email + OTP screens; MSW demo OTP `123456` |
| Agent directory | Hard-coded “Jane Ochieng” | API-backed officer profile and dealership — **partial** (seed + session email) |

---

## Pricing and payments

| Gap | Prototype | Production target |
|-----|-----------|-------------------|
| Daily installment | `calcDaily()` in [`js/data.js`](prototype/js/data.js) / capture | **API quote only** — display BFF response |
| Min deposit | `MIN_DEPOSIT` / `minDeposit()` client map | API rules by operating model — **partial** (client `MIN_DEPOSIT_KES` for stage gate; quotes from BFF) |
| STK / M-Pesa code | Simulated timeouts and confirm | **Partial (demo)** — BFF `POST …/deposits/stk` + `…/validate`, MSW updates `financing.depositPayment`; UI state machine in `product-deposit-stk-panel.tsx` |
| Product catalog prices | Static `PRODUCTS` array | **Partial (demo)** — `GET /api/onboarding/catalog/products` + MSW; quotes via catalog BFF |

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
| Next.js routes | `/desk`, `/capture/*` shipped — **closed** |
| Product quotes in capture | `POST /api/onboarding/catalog/quotes` + fixture GET; see applications contract |
| [`portal-migration.md`](portal-migration.md) | Documents **rider app**, not onboarding — do not use for this product |

---

## UX deferred

| Item | Decision |
|------|----------|
| Kiswahili | **Deferred** — English-only v1 |
| Tablet Playwright viewport | Mobile 390×844 in CI today; optional wider viewport in Phase 4 |
| PWA install prompts | **Partial** — install sheet + offline redirect in app; full parity with rider TBD |
| Pixel parity (desk/capture/flows) | **Open** — desk worklist + kraft folders aligned to `desk.js`; capture/flows still thin |

---

## When closing a gap

1. Update this file (mark resolved or move to “Accepted”).
2. Update [`implementation-status.md`](implementation-status.md).
3. If behavior changes, sync [`overview.md`](overview.md) §8.
