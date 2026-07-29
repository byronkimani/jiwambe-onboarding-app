# Onboarding map — task → files

Quick lookup for contributors and agents. Update when shipping features.

---

## Documentation

| Task | Files |
|------|-------|
| Product spec | [`docs/overview.md`](overview.md) |
| Phase plan | [`docs/implementation-plan.md`](implementation-plan.md) |
| Shipped matrix | [`docs/implementation-status.md`](implementation-status.md) |
| API contract | [`onboarding-applications-api-contract.md`](onboarding-applications-api-contract.md), [`onboarding-deposits-api-contract.md`](onboarding-deposits-api-contract.md), [`officer-auth-api-contract.md`](officer-auth-api-contract.md), [`field-rider-api-contract.md`](field-rider-api-contract.md) |
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
| Application resource types | [`src/lib/onboarding/application-resource.ts`](../src/lib/onboarding/application-resource.ts) |
| Desk card mapper | [`src/lib/onboarding/map-resource-to-desk-card.ts`](../src/lib/onboarding/map-resource-to-desk-card.ts) |
| Agent login shell | [`src/app/page.tsx`](../src/app/page.tsx) |
| Desk | [`src/app/desk/`](../src/app/desk/) |
| Capture | [`src/app/capture/`](../src/app/capture/) |
| Account blocked | [`src/app/account-blocked/page.tsx`](../src/app/account-blocked/page.tsx) |
| Offline | [`src/app/offline/page.tsx`](../src/app/offline/page.tsx) |
| Root layout | [`src/app/layout.tsx`](../src/app/layout.tsx) |
| Tokens | [`src/app/globals.css`](../src/app/globals.css) |

| Route | Purpose |
|-------|---------|
| `/` | Agent login (email + password + OTP) |
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
| Applications BFF | [`src/app/api/onboarding/applications/`](../src/app/api/onboarding/applications/) |
| Catalog BFF | [`src/app/api/onboarding/catalog/products/route.ts`](../src/app/api/onboarding/catalog/products/route.ts), [`catalog/quotes/route.ts`](../src/app/api/onboarding/catalog/quotes/route.ts) |
| Deposits BFF | [`src/app/api/onboarding/deposits/stk/route.ts`](../src/app/api/onboarding/deposits/stk/route.ts), [`deposits/validate/route.ts`](../src/app/api/onboarding/deposits/validate/route.ts) |
| Inventory BFF | [`src/app/api/onboarding/inventory/route.ts`](../src/app/api/onboarding/inventory/route.ts) |
| MSW applications store | [`src/mocks/applications-mock-state.ts`](../src/mocks/applications-mock-state.ts), [`handlers/onboarding-applications.ts`](../src/mocks/handlers/onboarding-applications.ts) |
| MSW deposits | [`src/mocks/deposits-mock-state.ts`](../src/mocks/deposits-mock-state.ts), [`handlers/onboarding-deposits.ts`](../src/mocks/handlers/onboarding-deposits.ts) |
| MSW catalog / inventory | [`handlers/onboarding-catalog.ts`](../src/mocks/handlers/onboarding-catalog.ts), [`handlers/onboarding-inventory.ts`](../src/mocks/handlers/onboarding-inventory.ts) |
| PWA | [`public/manifest.webmanifest`](../public/manifest.webmanifest), [`public/sw.js`](../public/sw.js) |

---

## Capture wizard (API-backed slice)

| Task | Files |
|------|-------|
| Wizard state + PATCH/submit | [`capture-wizard-context.tsx`](../src/components/onboarding/capture/capture-wizard-context.tsx), [`patch-application-with-recovery.ts`](../src/lib/onboarding/capture/patch-application-with-recovery.ts) |
| Stage validation | [`stage-validation.ts`](../src/lib/onboarding/capture/stage-validation.ts), [`application-submit-blocking.ts`](../src/lib/onboarding/application-submit-blocking.ts) |
| Resource ↔ form | [`resource-to-capture-form.ts`](../src/lib/onboarding/capture/resource-to-capture-form.ts), [`form-to-resource-patch.ts`](../src/lib/onboarding/capture/form-to-resource-patch.ts) |
| Product grid + quotes | [`use-catalog-products.ts`](../src/lib/onboarding/use-catalog-products.ts), product stage in [`capture-stage-body.tsx`](../src/components/onboarding/capture/stages/capture-stage-body.tsx) |
| STK + M-Pesa fallback UI | [`product-deposit-stk-panel.tsx`](../src/components/onboarding/capture/product-deposit-stk-panel.tsx), [`application-api.ts`](../src/lib/onboarding/capture/application-api.ts) |
| Bike inventory | [`use-inventory.ts`](../src/lib/onboarding/use-inventory.ts), [`inventory-catalog.ts`](../src/lib/onboarding/inventory/inventory-catalog.ts) |
| Desk worklist fetch | [`desk-worklist-screen.tsx`](../src/components/onboarding/desk/desk-worklist-screen.tsx) — queue / `scope=history` / `lifecycleState` |
| Zod + parse | [`application-schemas.ts`](../src/lib/onboarding/schemas/application-schemas.ts), [`deposit-schemas.ts`](../src/lib/onboarding/schemas/deposit-schemas.ts), [`parse-onboarding-json.ts`](../src/lib/onboarding/schemas/parse-onboarding-json.ts) |

---

## Tests

| Task | Files |
|------|-------|
| Route helpers | [`src/lib/global/shared/routes.test.ts`](../src/lib/global/shared/routes.test.ts) |
| Applications / deposits / inventory BFF | [`src/app/api/onboarding/applications/route.test.ts`](../src/app/api/onboarding/applications/route.test.ts), [`deposits/stk/route.test.ts`](../src/app/api/onboarding/deposits/stk/route.test.ts), [`inventory/route.test.ts`](../src/app/api/onboarding/inventory/route.test.ts) |
| MSW store | [`applications-mock-state.test.ts`](../src/mocks/applications-mock-state.test.ts), [`deposits-mock-state.test.ts`](../src/mocks/deposits-mock-state.test.ts) |
| E2E shell (tablet) | [`e2e/shell.spec.ts`](../e2e/shell.spec.ts) |
| E2E capture journey (mobile) | [`e2e/capture-journey.spec.ts`](../e2e/capture-journey.spec.ts), [`e2e/helpers/capture.ts`](../e2e/helpers/capture.ts) |
| E2E runner | [`e2e/run-playwright.cjs`](../e2e/run-playwright.cjs), [`playwright.config.ts`](../playwright.config.ts) |
| CI | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
