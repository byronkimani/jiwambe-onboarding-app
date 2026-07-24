# Onboarding map — task → files

Quick lookup for contributors and agents. Update when shipping features.

---

## Documentation

| Task | Files |
|------|-------|
| Product spec | [`docs/overview.md`](overview.md) |
| Phase plan | [`docs/implementation-plan.md`](implementation-plan.md) |
| Shipped matrix | [`docs/implementation-status.md`](implementation-status.md) |
| API contract | [`docs/field-rider-api-contract.md`](field-rider-api-contract.md), [`docs/field-rider.openapi.yaml`](field-rider.openapi.yaml) |
| Portal migration (rider app only) | [`docs/portal-migration.md`](portal-migration.md) |
| Prototype hub | [`docs/prototype/index.html`](prototype/index.html), [`docs/prototype/README.md`](prototype/README.md) |

---

## Prototype (field tablet — SSOT)

| Task | Files |
|------|-------|
| Hub | [`docs/prototype/index.html`](prototype/index.html) |
| Auth slice | [`docs/prototype/auth.html`](prototype/auth.html), [`js/auth.js`](prototype/js/auth.js) |
| Capture slice | [`docs/prototype/capture.html`](prototype/capture.html), [`js/capture.js`](prototype/js/capture.js) |
| Desk slice | [`docs/prototype/desk.html`](prototype/desk.html), [`js/desk.js`](prototype/js/desk.js), [`js/flows.js`](prototype/js/flows.js) |
| Full SPA | [`docs/prototype/prototype.html`](prototype/prototype.html), [`js/app.js`](prototype/js/app.js) |
| Tokens / atoms | [`docs/prototype/js/shared.js`](prototype/js/shared.js) |
| Seed data | [`docs/prototype/js/data.js`](prototype/js/data.js) |

---

## Routes and pages (Next.js)

| Task | Files |
|------|-------|
| Route constants | [`src/lib/global/shared/routes.ts`](../src/lib/global/shared/routes.ts) |
| Agent login shell | [`src/app/page.tsx`](../src/app/page.tsx) |
| Desk | [`src/app/desk/`](../src/app/desk/) |
| Capture | [`src/app/capture/`](../src/app/capture/) |
| Account blocked | [`src/app/account-blocked/page.tsx`](../src/app/account-blocked/page.tsx) |
| Offline | [`src/app/offline/page.tsx`](../src/app/offline/page.tsx) |
| Root layout | [`src/app/layout.tsx`](../src/app/layout.tsx) |
| Tokens | [`src/app/globals.css`](../src/app/globals.css) |

| Route | Purpose |
|-------|---------|
| `/` | Agent login (phone + password) |
| `/desk` | Worklist |
| `/desk/history` | Completed applications |
| `/desk/drafts` | Paused / draft applications |
| `/desk/applications/[id]` | Application detail |
| `/desk/applications/[id]/agreement` | Loan agreement |
| `/desk/applications/[id]/release` | Bike handover |
| `/desk/applications/[id]/summary` | Read-only summary |
| `/capture` | Redirect to `readiness` |
| `/capture/[stage]` | `readiness` … `review` |
| `/offline` | Offline page |
| `/account-blocked` | Disabled agent account |

---

## Infrastructure

| Task | Files |
|------|-------|
| Env | [`src/lib/global/shared/env.ts`](../src/lib/global/shared/env.ts) |
| Auth config | [`src/auth.config.ts`](../src/auth.config.ts) |
| Route gate stub | [`src/proxy.ts`](../src/proxy.ts) |
| MSW | [`src/instrumentation.ts`](../src/instrumentation.ts), [`src/mocks/`](../src/mocks/) |
| Health BFF | [`src/app/api/onboarding/health/route.ts`](../src/app/api/onboarding/health/route.ts) |
| PWA | [`public/manifest.webmanifest`](../public/manifest.webmanifest), [`public/sw.js`](../public/sw.js) |

---

## Tests

| Task | Files |
|------|-------|
| Route helpers | [`src/lib/global/shared/routes.test.ts`](../src/lib/global/shared/routes.test.ts) |
| E2E smoke | [`e2e/shell.spec.ts`](../e2e/shell.spec.ts) |
| CI | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
