# Jiwambe Onboarding — Documentation

**Product:** Jiwambe Onboarding (`jiwambe-onboarding-app`) — **tablet PWA for onboarding agents** at offices and partner dealerships (in-person conversion and handover).

**Status:** Phase 0–5 shipped/demo UI; capture **Phase 6–8** slice (applications + catalog + deposits + inventory BFF, MSW) is **demo UI** — see [`implementation-status.md`](implementation-status.md).

## Read order

1. [`overview.md`](overview.md) — product SSOT
2. [`implementation-plan.md`](implementation-plan.md) — phased delivery
3. [`implementation-status.md`](implementation-status.md) — shipped vs planned
4. [`prototype/`](prototype/) — layout and copy reference
5. [`onboarding-map.md`](onboarding-map.md) — task → files
6. [`onboarding-applications-api-contract.md`](onboarding-applications-api-contract.md) — officer application resource
7. [`onboarding-deposits-api-contract.md`](onboarding-deposits-api-contract.md) — STK + M-Pesa validate
8. [`onboarding-disqualify-rules.md`](onboarding-disqualify-rules.md) — disqualify vs pause; CRM owns ops approval
8. [`field-rider-api-contract.md`](field-rider-api-contract.md) — rider self-serve sketch
9. [`prototype-gaps.md`](prototype-gaps.md) — prototype vs production

## UX prototype

[`prototype/index.html`](prototype/index.html) — auth, capture, desk, full app. See [`prototype/README.md`](prototype/README.md).

## Index

| Doc | Purpose |
|-----|---------|
| [`overview.md`](overview.md) | Application overview |
| [`implementation-plan.md`](implementation-plan.md) | Phased plan |
| [`implementation-status.md`](implementation-status.md) | Delivery matrix |
| [`onboarding-map.md`](onboarding-map.md) | Task → file lookup |
| [`field-rider-api-contract.md`](field-rider-api-contract.md) | Rider self-serve API sketch |
| [`onboarding-applications-api-contract.md`](onboarding-applications-api-contract.md) | Officer application resource + endpoints |
| [`onboarding-deposits-api-contract.md`](onboarding-deposits-api-contract.md) | Deposit STK + validate |
| [`onboarding-disqualify-rules.md`](onboarding-disqualify-rules.md) | Disqualify rules; ops approval in CRM |
| [`field-rider.openapi.yaml`](field-rider.openapi.yaml) | OpenAPI draft |
| [`prototype-gaps.md`](prototype-gaps.md) | Prototype vs production |
| [`portal-migration.md`](portal-migration.md) | **Rider app only** — not this product |
