# Jiwambe Onboarding — API contract

**Product:** `jiwambe-onboarding-app` (onboarding agents, tablet PWA)  
**Last updated:** 2026-07-30

This is the **only** API contract for this repository. The browser calls **Next.js BFF** routes only; BFF proxies to the Jiwambe platform API.

**OpenAPI:** [`api-contract.openapi.yaml`](api-contract.openapi.yaml) (upstream paths; keep in sync with this file).

## Conventions

| Item | Value |
|------|--------|
| Upstream base | `{JIWAMBE_API_BASE_URL}` (includes `/api/v1`) |
| Auth | `Authorization: Bearer <access_token>` on protected upstream calls |
| Officer auth BFF | `/api/onboarding/auth/*`, `/api/onboarding/logout` |
| Onboarding domain BFF | `/api/onboarding/applications/*` |
| Shared platform BFF | `/api/customers/*`, `/api/catalog/*`, `/api/inventory`, `/api/payments/*` |
| Money | Daily installment, min deposit, financed amount — **server-computed**; UI display-only ([`AGENTS.md`](../AGENTS.md)) |
| Capture wizard | UI step order only; API stores one **application resource** (no `stages` in JSON) |
| Types / Zod | [`application-schemas.ts`](../src/lib/onboarding/schemas/application-schemas.ts), [`deposit-schemas.ts`](../src/lib/onboarding/schemas/deposit-schemas.ts) |
| Canonical fixture | [`sample-application-resource.ts`](../src/lib/onboarding/fixtures/sample-application-resource.ts) |

### BFF → upstream map

| BFF | Upstream | MSW | Notes |
|-----|----------|-----|--------|
| `POST /api/onboarding/auth/login` | `POST /onboarding/auth/login` | ✅ | |
| `POST /api/onboarding/auth/otp/resend` | `POST /onboarding/auth/otp/resend` | ✅ | |
| `POST /api/onboarding/logout` | `POST /onboarding/auth/logout` | ✅ | Refresh from JWT |
| `POST /api/onboarding/auth/activate` | `POST /onboarding/auth/activate` | ✅ | |
| `POST /api/onboarding/auth/activate/password` | `POST /onboarding/auth/activate/password` | ✅ | |
| `POST /api/onboarding/auth/password/forgot` | `POST /onboarding/auth/password/forgot` | ✅ | |
| `POST /api/onboarding/auth/password/reset` | `POST /onboarding/auth/password/reset` | ✅ | |
| `POST /api/onboarding/auth/password/reset/password` | `POST /onboarding/auth/password/reset/password` | ✅ | |
| *(server only)* | `POST /onboarding/auth/otp/verify` | ✅ | Auth.js `authorize()` only — **no** public BFF route |
| *(server only)* | `POST /onboarding/auth/refresh` | ✅ | Auth.js `jwt` callback only |
| `GET/POST/PATCH /api/onboarding/applications` | `/onboarding/applications` | ✅ | |
| `GET /api/onboarding/applications/current` | `/onboarding/applications/current` | ✅ | |
| `GET/PATCH /api/onboarding/applications/:id` | `/onboarding/applications/:id` | ✅ | PATCH requires `version` |
| `POST …/:id/pause` | same | ✅ | |
| `POST …/:id/submit` | same | ✅ | `422` + `blockingIssues` when invalid |
| `POST …/:id/disqualify` | same | ✅ | `DRAFT` / `PAUSED` only |
| `POST /api/customers/search` | `POST /customers/search` | ✅ | |
| `GET /api/catalog/products` | `GET /catalog/products` | ✅ | |
| `GET /api/catalog/pricing-rules` | `GET /catalog/pricing-rules` | ✅ | Fallback to local rules if upstream missing |
| `POST /api/catalog/quotes` | `POST /catalog/quotes` | ✅ | Financing calculator; fallback local |
| `GET /api/inventory` | `GET /inventory` | ✅ | Optional `?dealershipId=` |
| `POST /api/payments/stk` | `POST /payments/stk` | ✅ | |
| `POST /api/payments/validate` | `POST /payments/validate` | ✅ | |
| `GET /api/onboarding/health` | — | — | BFF-only `{ ok: true }` |
| `POST …/documents/init` | planned | ❌ | UI placeholders |
| `POST …/documents/:id/complete` | planned | ❌ | |

Route constants: [`routes.ts`](../src/lib/global/shared/routes.ts).

---

## Officer authentication

Email + password, then SMS OTP. Distinct from rider phone OTP in **`jiwambe-rider-app`**.

| Upstream | Purpose |
|----------|---------|
| `POST /onboarding/auth/login` | Returns `otp_session_id`, `masked_phone` |
| `POST /onboarding/auth/otp/verify` | Returns tokens + `officer` — **server-to-server only** |
| `POST /onboarding/auth/otp/resend` | Resend SMS code |
| `POST /onboarding/auth/refresh` | Refresh access token (jwt callback) |
| `POST /onboarding/auth/logout` | Revoke refresh token |
| `POST /onboarding/auth/activate` | CRM magic-link token → password setup session |
| `POST /onboarding/auth/activate/password` | Set initial password |
| `POST /onboarding/auth/password/forgot` | Request reset email |
| `POST /onboarding/auth/password/reset` | Validate reset link token |
| `POST /onboarding/auth/password/reset/password` | Set new password |

Common errors: `invalid_credentials` (401), `account_blocked` (403), `invalid_otp` (401, optional `retries_remaining`), `rate_limited` (429), `otp_expired` (410), `activation_expired` / `reset_expired` (410).

**Demo (MSW):** `john@jiwambe.com` / `demo12345` → OTP `123456`.

---

## Application resource

### Lifecycle (`lifecycleState`)

| State | Agent meaning |
|-------|----------------|
| `DRAFT` | In-progress capture |
| `PAUSED` | Paused draft; bike hold cleared |
| `OPS_REVIEW` | Submitted to operations |
| `LMS_CREATED` | Approved — agreement flow |
| `AGREEMENT_SIGNED` | Signed — preparing release |
| `READY_FOR_RELEASE` | Handover |
| `ACTIVE_LOAN` | Complete (history) |
| `DISQUALIFIED` | Terminal (history) |

`operatingModel.type`: `FLEET` | `STAGE` | `DELIVERY` | `PERSONAL`.

Desk cards are a UI projection: [`map-resource-to-desk-card.ts`](../src/lib/onboarding/map-resource-to-desk-card.ts).

### Documents (planned)

Inline documents on the resource with `url`, `status` (`uploading` | `ready` | `failed` | `rejected`).

1. `POST /onboarding/applications/:id/documents/init`
2. Client PUT to presigned `uploadUrl`
3. `POST /onboarding/applications/:id/documents/:documentId/complete`

Not wired in BFF/MSW yet — capture uses photo placeholders.

---

## Application endpoints

### `POST /onboarding/applications`

Create after readiness attestations.

```json
{
  "readinessAttestations": {
    "hasId": true,
    "knowsKra": true,
    "dlKnown": true,
    "cogcKnown": true,
    "hasFunds": true,
    "refsBriefed": true
  }
}
```

**Response:** `201` — full resource, `lifecycleState`: `DRAFT`.

### `GET /onboarding/applications`

| Query | Result |
|-------|--------|
| *(none)* | Officer **queue** — `OPS_REVIEW`, `LMS_CREATED`, `AGREEMENT_SIGNED`, `READY_FOR_RELEASE` |
| `lifecycleState=DRAFT` or `PAUSED` | Drafts / paused |
| `scope=history` | `DISQUALIFIED`, `ACTIVE_LOAN` |

**Response:** `{ "applications": OnboardingApplicationSummary[] }`

### `GET /onboarding/applications/current`

Latest `DRAFT` or `PAUSED` for the officer. `404` if none.

### `GET /onboarding/applications/:id`

Full resource.

### `PATCH /onboarding/applications/:id`

Partial update; **must include `version`**. `409 version_conflict` on mismatch.

### `POST /onboarding/applications/:id/pause`

```json
{ "reason": "Customer stepped out to fetch documents" }
```

`200` — `lifecycleState`: `PAUSED`; bike hold cleared upstream.

### `POST /onboarding/applications/:id/submit`

`{}` or `{ "officerAttestation": true }`. `DRAFT`/`PAUSED` → `OPS_REVIEW` when valid.

`422` example:

```json
{
  "error": "validation_failed",
  "blockingIssues": [{ "code": "identity.phone", "message": "Phone is required." }]
}
```

### `POST /onboarding/applications/:id/disqualify`

```json
{ "reason": "Reference verification failed — unreachable" }
```

- `reason` — min 6 characters (same as pause).
- Allowed only from **`DRAFT`** or **`PAUSED`** — not after submit (`OPS_REVIEW`+); use CRM for ops-stage decisions.
- Terminal: clears pause and bike assignment; not reversible in-app.

---

## Customers

### `POST /customers/search`

Portal / lead lookup at capture **lookup** stage.

```json
{ "phone": "+254722118456", "nationalId": null }
```

**Response:**

```json
{
  "matches": [
    {
      "leadId": "…",
      "source": "portal",
      "displayName": "…",
      "phoneMasked": "…",
      "nationalIdMasked": "…"
    }
  ]
}
```

---

## Catalog

Shared catalog service (also used by other Jiwambe apps).

### `GET /catalog/products`

**Response:** `{ "products": [{ "id", "label", "priceNew", "priceUsed", … }] }`

### `GET /catalog/pricing-rules`

Minimum deposit **per operating model** for the **readiness** step (before product selection).

**Response:**

```json
{
  "operatingModels": [
    { "operatingModel": "FLEET", "label": "Fleet (Bolt)", "minDepositKes": 5000 }
  ],
  "currency": "KES"
}
```

Same `minDepositKes` values appear on `POST /catalog/quotes` for the selected model.

### `POST /catalog/quotes`

**Financing calculator** for the **product** stage.

**Request:**

```json
{
  "productId": "spiro-tv",
  "depositKes": 15000,
  "termMonths": 18,
  "operatingModel": "FLEET",
  "assetCondition": "new"
}
```

`termMonths`: `18` or `24`. `assetCondition`: `new` | `used` (optional, default `new`).

**Response (display-only in UI):**

```json
{
  "productId": "spiro-tv",
  "depositKes": 15000,
  "termMonths": 18,
  "operatingModel": "FLEET",
  "assetPriceKes": 265000,
  "financedAmountKes": 250000,
  "dailyAmountKes": 510,
  "minDepositKes": 5000,
  "currency": "KES"
}
```

Client PATCHes `financing` on the application from quote fields after verify.

---

## Inventory

### `GET /inventory`

Dealership stock for **bike** stage. Optional `?dealershipId=`.

**Response:**

```json
{
  "items": [{ "registration", "model", "color", "status", … }],
  "rules": { "softHoldMinutes", "assignableStatuses", … }
}
```

---

## Payments

Deposit verification is server-authoritative; UI shows BFF status and PATCHes `financing.depositPayment` after `verified`.

### `POST /payments/stk`

```json
{
  "applicationReferenceCode": "A-2001",
  "depositKes": 10000,
  "phone": "+254712334556"
}
```

**Response:**

```json
{
  "checkoutId": "ws_CO_…",
  "status": "waiting",
  "expiresAt": "2026-07-29T15:00:00Z"
}
```

### `POST /payments/validate`

STK poll:

```json
{ "applicationReferenceCode": "A-2001", "checkoutId": "ws_CO_…" }
```

M-Pesa code fallback:

```json
{ "applicationReferenceCode": "A-2001", "mpesaReceipt": "UGE2ETEST01" }
```

**Response:**

```json
{
  "status": "verified",
  "mpesaReceipt": "UGDEMO123",
  "depositPayment": {
    "method": "stk",
    "status": "verified",
    "verifiedAt": "2026-07-29T14:30:00Z",
    "mpesaReceipt": "UGDEMO123"
  },
  "applicationVersion": 5
}
```

Statuses: `verified` | `pending` | `failed`.

---

## Agreement and release

Desk flows (`/desk/applications/[id]/agreement`, `…/release`) are **demo UI** with fixture data. Dedicated upstream ceremony APIs are **not** wired yet — state transitions after `LMS_CREATED` are driven by MSW seeds / CRM in production.
