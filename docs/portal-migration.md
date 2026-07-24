# Portal migration — customer portal → rider app

> **Scope:** This document applies to **`jiwambe-rider-app`**, not **`jiwambe-onboarding-app`**. Onboarding is the **agent tablet** product for in-person capture and handover; riders use the rider app after activation. See [`overview.md`](overview.md).

**Status:** Planning  
**Goal:** `jiwambe-rider-app` eventually **replaces** `jiwambe-customer-portal` as the unified bike-first rider PWA.

The customer portal uses `/portal/*` upstream APIs and `@jiwambe/components`. The rider app uses **`/riders/*`** APIs and **shadcn/ui + Tailwind 4** (agents pattern).

---

## Route parity

| Customer portal | Rider app (target) | Notes |
|-----------------|-------------------|-------|
| `/` (login) | `/` | Same OTP pattern |
| `/dashboard` | `/owner/bike` + `/owner/pay` | Bike-first: hero on Bike; pay CTA on Pay |
| `/my-loan` | `/owner/pay` | Balance, daily amount, ledger |
| `/my-motorbike` | `/owner/bike` | Asset details, plate, telemetry |
| `/payments` | `/owner/pay` | STK + history |
| Inbox / notifications | `/owner/more` | Notification list |
| `/support` | `/owner/service` | Tickets + support wizard |
| `/settings` | `/owner/more` | Contacts, legal, sign out |
| `/profile` | `/owner/more` | Profile section |
| — | `/apply` | **New** — onboarding not in portal |
| — | `/pending` | **New** — application timeline |
| `/offline` | `/offline` | Same pattern |

---

## API parity (draft)

| Portal API | Rider API (target) | Notes |
|------------|-------------------|-------|
| `POST /portal/auth/otp/request` | `POST /riders/auth/otp/request` | Same flow, new namespace |
| `POST /portal/auth/otp/verify` | `POST /riders/auth/otp/verify` | |
| `GET /portal/me` | `GET /riders/me` | Adds `lifecycleStage` |
| `GET /portal/dashboard` | `GET /riders/facility` + `GET /riders/me` | Split or combined TBD |
| `GET /portal/asset` | `GET /riders/asset` | Bike + telemetry |
| `GET /portal/loans` | `GET /riders/facility` | Loan terms, balance |
| `POST /portal/payments/stk` | `POST /riders/payments/stk` | |
| `GET /portal/payments` | `GET /riders/payments` | |
| `GET /portal/notifications` | `GET /riders/notifications` | |
| `POST /portal/feedback` | `POST /riders/feedback` | |
| `GET /portal/services/*` | `GET /riders/service/*` | Mechanics, swap stations |
| `POST /portal/devices` | `POST /riders/devices` | Web push |
| — | `POST /riders/applications` | **New** — apply flow |
| — | `GET /riders/catalog/products` | **New** — bike catalog |

All shapes are **assumptions** — confirm with API team before cutover.

---

## Migration strategy (TBD)

1. **Phase A:** Rider app ships onboarding (`/apply`, `/pending`) — portal keeps active riders.
2. **Phase B:** Owner tabs reach parity with portal dashboard/payments/asset.
3. **Phase C:** Redirect portal users to rider app; deprecate portal repo.

Exact cutover criteria to be defined in Phase 10.

---

## UI stack difference

| | Customer portal | Rider app |
|--|-----------------|-----------|
| Components | `@jiwambe/components` | shadcn/ui |
| Tailwind | v3 + preset | v4 + CSS variables |
| Mental model | Loan/dashboard first | Bike-first tabs |

Do not port portal components directly — rebuild from prototype UX.
