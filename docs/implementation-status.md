# Implementation status — Jiwambe Onboarding

**Last updated:** 2026-07-28  
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
| 6–8 | Capture wizard | **Demo UI** (`capture-stage-body` per-stage prototype UI) |
| 9 | Agreement and release | **Demo UI** (viewer, PDI, OTP, summary timeline) |
| 10–11 | API integration, hardening | **Planned** |

---

## Auth

| Surface | Status | Notes |
|---------|--------|-------|
| Email + OTP login | **Demo UI** | Prototype `auth.js` on `/` |
| Route gate (`proxy.ts`) | **Shipped** | Protects `/desk`, `/capture`, BFF |
| Demo officer | **Shipped** | Email `jane.ochieng@contractor.jiwambe.com`, password 8+ chars, OTP `123456` |

---

## Routes (Next.js `src/app`)

| Route | UI | Data |
|-------|-----|------|
| `/` | **Demo UI** | Login |
| `/desk`, `/desk/history`, `/desk/drafts`, `/desk/profile` | **Demo UI** | `GET /api/onboarding/applications` |
| `/desk/applications/[id]` | **Shipped** | Redirect to primary flow route |
| `/desk/applications/[id]/agreement` … `release`, `summary` | **Demo UI** | Fixture flows |
| `/capture/[stage]` | **Demo UI** | Client wizard + quote BFF stub |
| `/offline`, `/account-blocked`, `not-found` | **Demo UI** | Rider-style offline; agent support contacts |
| `GET /api/onboarding/health` | **Shipped** | `{ ok: true }` |
| `GET /api/onboarding/catalog/quotes` | **Demo UI** | Pre-seeded quote table |

---

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| UX prototype in repo | **Shipped** | `docs/prototype/` |
| MSW onboarding auth | **Shipped** | `POST /onboarding/agents/auth/login` |
| Real upstream API | **Planned** | Replace MSW when contract lands |
| File upload / OCR / face | **Planned** | UI placeholders only |
| Offline sync queue | **Planned** | TopBar online toggle + queued badge stub |
| PWA install prompt | **Demo UI** | `beforeinstallprompt` sheet + dismiss storage |
| Kiswahili | **Deferred** | English-only v1 |
