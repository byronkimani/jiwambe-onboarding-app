# Implementation status — Jiwambe Onboarding

**Last updated:** 2026-07-24  
**Repository:** `jiwambe-onboarding-app`  
**Overview:** [`overview.md`](overview.md)  
**Plan:** [`implementation-plan.md`](implementation-plan.md)

Legend: **Shipped** | **Shell** | **Legacy** | **Planned** | **Deferred**

---

## Phase progress (summary)

| Phase | Name | Status |
|-------|------|--------|
| 0 | Documentation and product SSOT | **Shipped** |
| 1 | Repository bootstrap | **Shipped** |
| 2 | Route realignment | **Shipped** |
| 3–11 | See [`implementation-plan.md`](implementation-plan.md) | **Planned** |

---

## Repository and bootstrap

| Item | Status | Notes |
|------|--------|-------|
| Product overview + implementation plan | **Shipped** | 2026-07-24 |
| Prototype split (`docs/prototype/`) | **Shipped** | auth / capture / desk / full |
| CI (lint, typecheck, test, build, e2e) | **Shipped** | `.github/workflows/ci.yml` |
| `pnpm audit` clean | **Shipped** | Next 16.2.11, sharp override |
| Vercel preview | **Planned** | After first deploy to `sandbox` |

---

## Routes (Next.js `src/app`)

| Route | UI | Notes |
|-------|-----|-------|
| `/`, `/offline`, `/account-blocked` | **Shell** | Public |
| `/desk`, `/desk/history`, `/desk/drafts` | **Shell** | Desk layout + nav |
| `/desk/applications/[id]` (+ agreement, release, summary) | **Shell** | Application sub-flows |
| `/capture`, `/capture/[stage]` | **Shell** | Redirect + 10 stages |
| `GET /api/onboarding/health` | **Shipped** | `{ ok: true }` |

---

## Features

| Feature | Status |
|---------|--------|
| UX prototype in repo | **Shipped** | Field tablet HTML |
| Agent auth (phone + password) | **Planned** | Phase 3 |
| Desk worklist | **Planned** | Phase 5 |
| Capture wizard | **Planned** | Phases 6–8 |
| Agreement and release | **Planned** | Phase 9 |
| Offline sync | **Planned** | Phase 10 |
| Backend API wire-up | **Planned** | Phase 10 — contract TBD |
| Kiswahili | **Deferred** | English-only v1 |
