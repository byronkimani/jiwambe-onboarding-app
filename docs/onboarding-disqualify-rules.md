# Disqualify — business rules (onboarding app)

**Ops approval** (moving applications to `LMS_CREATED` and beyond) happens in **CRM / back-office**, not in this tablet app.

This document describes **disqualify** as implemented in the onboarding BFF and MSW mock.

## When officers use disqualify

Close an application **permanently** when the customer cannot or should not proceed (policy, failed verification, customer withdrawal, etc.). Disqualify is **not** a temporary pause.

## API

`POST /onboarding/applications/:id/disqualify`

**Request:**

```json
{ "reason": "Reference verification failed — unreachable" }
```

- `reason` — required, minimum **6** characters (same as pause).

**Success:** `200` with full application resource, `lifecycleState`: `DISQUALIFIED`.

## Allowed source states (MSW / contract)

| State | Allowed |
|-------|---------|
| `DRAFT` | Yes |
| `PAUSED` | Yes |
| `OPS_REVIEW` and later (`LMS_CREATED`, …) | **No** — submitted or post-submit; use **CRM** |
| `DISQUALIFIED` | **No** — already terminal |

## Side effects (demo MSW)

- `lifecycleState` → `DISQUALIFIED`
- `pause` cleared
- `bikeAssignment` cleared (bike released to stock)
- `operations.opsNote` set to the disqualify **reason** (display on desk/history)
- `version` incremented
- **Cannot be undone** in the app (matches [`overview.md`](overview.md))

## UI (this app)

- **Capture wizard:** Disqualify is available once an application exists (`referenceCode` after readiness create). Reason modal → BFF → MSW.
- **Desk:** Post-submit disqualify on worklist folders is **not** wired in v1; use CRM for ops-stage decisions or extend desk later.

## Pause vs disqualify

| | Pause | Disqualify |
|---|--------|------------|
| Intent | Resume later | Terminal close (in-capture only) |
| States | In-capture (`DRAFT` → `PAUSED`) | `DRAFT`, `PAUSED` only — **not** after submit (`OPS_REVIEW`+) |
| Bike on pause | Cleared on pause (demo) | Cleared on disqualify |
| Reversible | Yes (resume capture) | No |
