# Onboarding map — task → files

Quick lookup for contributors. Update when shipping features.

---

## Documentation

| Task | Files |
|------|-------|
| Product spec | [`overview.md`](overview.md) |
| API (single contract) | [`api-contract.md`](api-contract.md), [`api-contract.openapi.yaml`](api-contract.openapi.yaml) |
| Shipped matrix | [`implementation-status.md`](implementation-status.md) |
| Remaining phases | [`implementation-plan.md`](implementation-plan.md) |
| Prototype reference | [`prototype/index.html`](prototype/index.html) |

---

## Routes (Next.js)

| Route | Purpose |
|-------|---------|
| `/` | Agent login |
| `/desk`, `/desk/history`, `/desk/drafts`, `/desk/profile` | Worklist |
| `/desk/applications/[id]/agreement` … `release`, `summary` | Post-ops flows |
| `/capture/[stage]` | Capture wizard (`readiness` … `review`) |
| `/account-blocked` | Disabled agent |

Constants: [`routes.ts`](../src/lib/global/shared/routes.ts)

---

## BFF (`src/app/api`)

| Domain | Path | Handler |
|--------|------|---------|
| Auth | `/api/onboarding/auth/*`, `/api/onboarding/logout` | [`onboarding/auth/`](../src/app/api/onboarding/auth/) |
| Applications | `/api/onboarding/applications/*` | [`onboarding/applications/`](../src/app/api/onboarding/applications/) |
| Customers | `/api/customers/search` | [`customers/search/route.ts`](../src/app/api/customers/search/route.ts) |
| Catalog | `/api/catalog/products`, `pricing-rules`, `quotes` | [`catalog/`](../src/app/api/catalog/) |
| Inventory | `/api/inventory` | [`inventory/route.ts`](../src/app/api/inventory/route.ts) |
| Payments | `/api/payments/stk`, `validate` | [`payments/`](../src/app/api/payments/) |

---

## MSW (`src/mocks/handlers`)

| Handler module | Upstream paths |
|----------------|----------------|
| `onboarding-officer-auth.ts` | `/onboarding/auth/*` |
| `onboarding-applications.ts` | `/onboarding/applications/*` |
| `ecosystem-customers.ts` | `/customers/search` |
| `ecosystem-catalog.ts` | `/catalog/*` |
| `ecosystem-inventory.ts` | `/inventory` |
| `ecosystem-payments.ts` | `/payments/*` |

Index: [`handlers/index.ts`](../src/mocks/handlers/index.ts)

---

## Capture wizard

| Task | Files |
|------|-------|
| Stage UI | [`capture-stage-body.tsx`](../src/components/onboarding/capture/stages/capture-stage-body.tsx) |
| Wizard state | [`capture-wizard-context.tsx`](../src/components/onboarding/capture/capture-wizard-context.tsx) |
| Validation | [`stage-validation.ts`](../src/lib/onboarding/capture/stage-validation.ts) |
| Resource ↔ form | [`resource-to-capture-form.ts`](../src/lib/onboarding/capture/resource-to-capture-form.ts) |
| Quotes / products | [`use-catalog-quote.ts`](../src/lib/onboarding/use-catalog-quote.ts), [`use-catalog-products.ts`](../src/lib/onboarding/use-catalog-products.ts) |
| Pricing rules | [`use-pricing-rules.ts`](../src/lib/onboarding/use-pricing-rules.ts) |
| STK panel | [`product-deposit-stk-panel.tsx`](../src/components/onboarding/capture/product-deposit-stk-panel.tsx) |
| Inventory | [`use-inventory.ts`](../src/lib/onboarding/use-inventory.ts) |

---

## Desk

| Task | Files |
|------|-------|
| Worklist | [`desk-worklist-screen.tsx`](../src/components/onboarding/desk/desk-worklist-screen.tsx) |
| Folder cards | [`application-folder-card.tsx`](../src/components/onboarding/desk/application-folder-card.tsx) |
| Board view | [`desk-board-view.tsx`](../src/components/onboarding/desk/desk-board-view.tsx) |

---

## Tests

| Task | Files |
|------|-------|
| E2E capture | [`e2e/capture-journey.spec.ts`](../e2e/capture-journey.spec.ts), [`e2e/helpers/capture.ts`](../e2e/helpers/capture.ts) |
| BFF unit tests | [`src/app/api/**/route.test.ts`](../src/app/api/) |
