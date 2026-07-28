# Jiwambe Onboarding — Implementation Plan

**Status:** Active  
**Overview:** [`overview.md`](overview.md)  
**Implementation status:** [`implementation-status.md`](implementation-status.md)  
**Onboarding map:** [`onboarding-map.md`](onboarding-map.md)  
**Design reference:** [`prototype/`](prototype/)  
**API sketch:** [`field-rider-api-contract.md`](field-rider-api-contract.md) — officer endpoints **TBD**  
**Last updated:** 2026-07-24

---

## How to use this plan

1. **Phase progress** — at-a-glance status below.
2. **Per-phase sections** — goal, scope, deliverables, tests, acceptance criteria.
3. **`implementation-status.md`** — update when a phase ships.
4. **Detail elsewhere** — UX in [`overview.md`](overview.md) and prototype; file paths in [`onboarding-map.md`](onboarding-map.md); API when backend contract lands.

### Global definition of done (every phase ≥ 1)

- [ ] `pnpm lint` — zero errors/warnings
- [ ] `pnpm typecheck` — clean
- [ ] `pnpm test --run` — all unit tests pass
- [ ] Playwright smoke for changed surfaces (`E2E=1`; primary **tablet 1024×768** project; mobile 390×844 smoke in `playwright.config.ts`)
- [ ] No `fetch(JIWAMBE_API_BASE_URL)` in `"use client"` files
- [ ] [`implementation-status.md`](implementation-status.md) updated for shipped surfaces
- [ ] Phase row in **Phase progress** table updated
- [ ] [`prototype-gaps.md`](prototype-gaps.md) updated if UX/API assumptions change

---

## Phase progress

| Phase | Name | Status |
|-------|------|--------|
| **0** | Documentation and product SSOT | **Done** |
| **1** | Repository bootstrap (infra) | **Done** |
| **2** | Route realignment (remove rider shells) | **Done** |
| **3–9** | UI-first demo (auth, chrome, desk, capture, flows) | **Done** (demo / MSW) |
| **10** | Offline sync and API integration | Planned |
| **11** | Hardening and production readiness | Planned |

**Status legend:** `Done` · `In progress` · `Planned` · `Blocked` · `Deferred`

---

## 1. Summary

Greenfield **Next.js PWA** for `jiwambe-onboarding-app`. **Onboarding agents** convert in-person leads through capture and handover. **`jiwambe-rider-app`** serves riders after activation.

**Hard rules** (see [`AGENTS.md`](../AGENTS.md)):

1. Pure BFF — browser never calls `JIWAMBE_API_BASE_URL` directly.
2. No frontend loan or price math — display API values only.
3. `pnpm` only; typed `AppRoutes`; tests mandatory per phase.
4. Playwright E2E every phase (mobile baseline 390×844).
5. Feature branches from `sandbox`; PRs target `sandbox`.
6. UI per [`docs/prototype/`](prototype/) unless overview overrides.
7. shadcn/ui + Tailwind 4.
8. English-only v1.

---

## 2. Architecture

```
Browser (PWA on tablet)
  → Next.js RSC / client components
  → /api/* BFF route handlers (placeholder: /api/rider/*)
  → upstreamRequest() + agent Bearer token from Auth.js session
  → JIWAMBE_API_BASE_URL (paths TBD)
```

**Auth (Phase 3):** Auth.js v5 — email + password + OTP (prototype `auth.js`; upstream TBD).

**MSW:** `MOCK_JIWAMBE_API=1` from Phase 1 instrumentation.

---

## Repository bootstrap (Phase 1 — done)

| Constant | Value |
|----------|-------|
| Repo / package | `jiwambe-onboarding-app` |
| Product name | **Jiwambe Onboarding** |
| Upstream env | `JIWAMBE_API_BASE_URL` (server-only) |
| Mock flag | `MOCK_JIWAMBE_API=1` |
| Design reference | `docs/prototype/` |
| **Caveat** | ~~`src/app` routes are legacy rider shells~~ — replaced in Phase 2 |

### Tech stack

Next.js 16, React 19, TypeScript strict, Tailwind 4, shadcn/ui, Vitest, Playwright, MSW, Auth.js v5 (Phase 3), Node 24, pnpm 11+.

### Target routing (Phase 2+)

| Concern | Pattern |
|---------|---------|
| Public | `/`, `/offline`, `/account-blocked`, `/api/auth/*` |
| Protected | `/desk`, `/desk/*`, `/capture`, `/capture/*`, authenticated BFF |
| Gate | `src/proxy.ts` |
| Routes | `AppRoutes` in `routes.ts` |

---

## Phase 0 — Documentation and product SSOT

**Goal:** Contributors understand the onboarding-agent product without reading the whole prototype.

**Deliverables:** [`overview.md`](overview.md), this plan, [`prototype-gaps.md`](prototype-gaps.md), updated status/map/README, prototype scope note on portal-migration.

**Acceptance:** Overview + plan describe users, lifecycle, flows, target routes, and relation to rider/agents apps.

**Status:** **Done** (2026-07-24).

---

## Phase 1 — Repository bootstrap (infra)

**Goal:** Runnable repo, CI, PWA assets, MSW hook, health BFF.

**Deliverables:** `src/app/` placeholders, `AppRoutes`, `env.ts`, `proxy.ts` stub, `GET /api/rider/health`, split [`docs/prototype/`](prototype/), Vitest + Playwright + CI.

**Acceptance:** `pnpm test:all` passes on `sandbox` branch workflow.

**Status:** **Done** — Phase 2 route shells shipped; auth in Phase 3.

---

## Phase 2 — Route realignment

**Goal:** Next.js routes match [`overview.md`](overview.md) §10; remove rider PWA shells.

**Status:** **Done** (2026-07-24).

**Scope:**

- Remove or redirect `/apply`, `/pending`, `/verify`, `/owner/*`
- Add shells: `/`, `/desk`, `/desk/history`, `/desk/drafts`, `/capture`, `/capture/[stage]`
- Rewrite [`routes.ts`](../src/lib/global/shared/routes.ts), [`routes.test.ts`](../src/lib/global/shared/routes.test.ts)
- Update [`e2e/shell.spec.ts`](../e2e/shell.spec.ts) for login + desk + capture
- Update [`ARCHITECTURE.md`](../ARCHITECTURE.md) public/protected paths

**Tests:** Route helper unit tests; E2E smoke on new shells.

**Acceptance:** No rider-owner routes in build output; `AppRoutes` matches overview table.

---

## Phase 3 — Agent auth (email + OTP)

**Goal:** Onboarding agents sign in; session gates protected routes.

**Deliverables:**

- Auth.js Credentials (email + password + OTP) + BFF login route (upstream TBD)
- `auth.ts`, `/api/auth/*`, `proxy.ts` wired with `auth.config.ts`
- MSW agent persona(s)
- Login UI per [`prototype/js/auth.js`](prototype/js/auth.js) (centered card, OTP step)

**Tests:** Auth route tests; E2E login → `/desk`.

**Acceptance:** Unauthenticated users cannot open `/desk` or `/capture`; tokens never exposed to client.

---

## Phase 4 — Tablet chrome

**Goal:** Shared layout for desk and capture — connectivity, sync queue, officer context.

**Deliverables:**

- TopBar, offline indicator, notification entry (stub data → API later)
- Tablet layout (min-width / rail + content); optional second Playwright viewport (e.g. 1024×768)
- `/offline` page wiring

**Tests:** Component tests where valuable; E2E offline banner behavior (mocked).

**Acceptance:** Capture and desk share chrome; PWA manifest unchanged.

---

## Phase 5 — Desk

**Goal:** Worklist board/list, history, drafts, open application by state.

**Deliverables:**

- `/desk` UI from [`prototype/js/desk.js`](prototype/js/desk.js)
- State tags, lifeline, folder cards
- Navigation to agreement/release/summary when `STATE_META.action` set
- BFF list/detail stubs + MSW seed apps

**Tests:** MSW list handlers; E2E open `LMS_CREATED` → agreement entry.

**Acceptance:** Agent can browse seeded worklist and open correct flow type.

---

## Phase 6 — Capture (readiness, lookup)

**Goal:** Start new application; customer lookup (portal vs new).

**Deliverables:**

- `/capture/readiness`, `/capture/lookup`
- Step rail; progress map
- “New application” from desk → capture

**Tests:** Stage navigation; readiness gate blocks advance.

**Acceptance:** Matches prototype readiness + lookup copy and layout.

---

## Phase 7 — Capture (identity, DL, COGC, references)

**Goal:** KYC-heavy stages with document slots (upload → BFF storage TBD).

**Deliverables:**

- Stages: identity, dl, cogc, references
- Photo capture UI; **no** production OCR/face logic — BFF returns scores when API exists
- Pause/disqualify modals in capture

**Tests:** Form validation edges; file upload mocked.

**Acceptance:** All four stages completable with MSW; documents not stored in localStorage for prod.

---

## Phase 8 — Capture (model, product, deposit, bike, review)

**Goal:** Financing, deposit confirmation, stock assignment, submit.

**Deliverables:**

- Operating model stage (fleet/stage/delivery/personal rules)
- Product + term + deposit — **quotes from BFF only** (remove prototype `calcDaily` in app code)
- STK + fallback code flows server-validated
- Bike assignment from inventory API; hold/release rules
- Review checklist + submit → OPS_REVIEW

**Tests:** Deposit cannot submit without server `stkVerified`; bike assignment MSW.

**Acceptance:** Submit creates worklist item; offline queues per Phase 10.

---

## Phase 9 — Post-ops (agreement and release)

**Goal:** Agreement ceremony and handover.

**Deliverables:**

- Agreement flow: scroll gate, dual signature capture, officer countersign
- Release flow: checklist, defect → pause, customer OTP verification
- Summary read-only view

**Reference:** [`prototype/js/flows.js`](prototype/js/flows.js)

**Tests:** E2E happy path agreement → ready; release OTP mocked.

**Acceptance:** State transitions match lifecycle table in overview.

---

## Phase 10 — Offline sync and API integration

**Goal:** Queue outbound mutations; wire real backend when contract available.

**Deliverables:**

- `upstreamRequest()` + typed BFF routes per backend contract
- Sync ledger UI backed by real queue state
- MSW parity with contract; rename `/api/rider/*` if needed

**Tests:** Integration tests against MSW from OpenAPI/contract; offline submit replay.

**Acceptance:** `MOCK_JIWAMBE_API=0` against staging with feature flag.

---

## Phase 11 — Hardening

**Goal:** Production readiness.

**Deliverables:**

- Full E2E journeys (login → capture → submit → agreement → release)
- Security review (BFF-only, headers, session)
- Performance on tablet targets
- Deployment runbook (Vercel/env)

**Acceptance:** Sign-off checklist in implementation-status; `pnpm audit` clean.

---

## Prototype gaps

See [`prototype-gaps.md`](prototype-gaps.md).

---

## Portal migration

[`portal-migration.md`](portal-migration.md) applies to **jiwambe-rider-app**, not this repository.
