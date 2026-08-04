# Jiwambe Onboarding — API contract

**Product:** `jiwambe-onboarding-app` (onboarding agents, tablet PWA)  
**Last updated:** 2026-08-03

This is the **only** API contract for this repository. The browser calls **Next.js BFF** routes only; BFF proxies to the Jiwambe platform API.

**OpenAPI:** [`api-contract.openapi.yaml`](api-contract.openapi.yaml) (upstream paths; keep in sync with this file).

## Conventions

| Item | Value |
|------|--------|
| Upstream base | `{JIWAMBE_API_BASE_URL}` — host root only (e.g. `http://127.0.0.1:18080`) |
| Correlation | `X-Request-ID` on browser → BFF → upstream (sanitized; echoed on responses) |
| Auth | `Authorization: Bearer <access_token>` on protected upstream calls |
| Officer auth BFF | `/api/onboarding/auth/*` (password demo; MSW `/v1/_demo/auth/*`) |
| Field realm BFF | `/v1/field/*` — **same path** as upstream field realm |
| BFF-only | `/api/onboarding/health`, dev/e2e reset, mock document upload |
| Money | Daily installment, min deposit, financed amount — **server-computed**; UI display-only ([`AGENTS.md`](../AGENTS.md)) |
| Capture wizard | UI step order only; API stores one **application resource** (no `stages` in JSON) |
| Types / Zod | [`application-schemas.ts`](../src/lib/onboarding/schemas/application-schemas.ts), [`deposit-schemas.ts`](../src/lib/onboarding/schemas/deposit-schemas.ts) |
| Canonical fixture | [`sample-application-resource.ts`](../src/lib/onboarding/fixtures/sample-application-resource.ts) |

### BFF → upstream map

Field-realm routes use **path parity**: browser path = upstream path (e.g. `GET /v1/field/applications`).

| BFF (browser) | Upstream (`JIWAMBE_API_BASE_URL` + path) | MSW | Notes |
|-----|----------|-----|--------|
| `POST /api/onboarding/auth/login` | `POST /v1/_demo/auth/login` | ✅ | **Demo only** — password flow |
| `POST /api/onboarding/auth/otp/resend` | `POST /v1/_demo/auth/otp/resend` | ✅ | |
| `POST /v1/field/auth/logout` | `POST /v1/field/auth/logout` | ✅ | Refresh from JWT |
| `POST /api/onboarding/auth/activate` | `POST /v1/_demo/auth/activate` | ✅ | |
| `POST /api/onboarding/auth/activate/password` | `POST /v1/_demo/auth/activate/password` | ✅ | |
| `POST /api/onboarding/auth/password/forgot` | `POST /v1/_demo/auth/password/forgot` | ✅ | |
| `POST /api/onboarding/auth/password/reset` | `POST /v1/_demo/auth/password/reset` | ✅ | |
| `POST /api/onboarding/auth/password/reset/password` | `POST /v1/_demo/auth/password/reset/password` | ✅ | |
| `POST /api/onboarding/auth/password/change` | `POST /v1/_demo/auth/password/change` | ✅ | |
| *(server only)* | `POST /v1/_demo/auth/otp/verify` | ✅ | Auth.js `authorize()` only |
| *(server only)* | `POST /v1/field/auth/refresh` | ✅ | Auth.js `jwt` callback — see [Token refresh](#token-refresh) |
| `GET /v1/field/auth/me` | `GET /v1/field/auth/me` | ✅ | Profile adapter for UI |
| `GET/POST/PATCH /v1/field/applications` | same | ✅ | |
| `GET /v1/field/applications/current` | same | ✅ | **Mock extension** |
| `GET/PATCH /v1/field/applications/:id` | same | ✅ | PATCH requires `version` |
| `POST …/:id/pause\|submit\|disqualify` | same | ✅ | |
| `POST /v1/field/customers/search` | same | ✅ | **Mock extension** (upstream: `GET …/lookup`) |
| `GET /v1/field/products` | same | ✅ | |
| `GET /v1/field/products/pricing-rules` | same | ✅ | **Mock extension** |
| `POST /v1/field/products/quote` | same | ✅ | |
| `GET /v1/field/bikes/assignable` | same | ✅ | Optional `?dealershipId=` |
| `POST /v1/field/payments/stk` | same | ✅ | |
| `POST /v1/field/payments/validate` | same | ✅ | **Mock extension** |
| `POST /v1/field/applications/:id/documents/init` | same | ✅ | Until `media/upload-url` |
| `POST …/documents/:documentId/complete` | same | ✅ | |
| `GET /api/onboarding/health` | — | — | BFF-only; **503** when degraded |

Route constants: [`routes.ts`](../src/lib/global/shared/routes.ts) (`FieldRoutes`).

### Gaps (follow-up)

- `PATCH` → upstream `PUT` full-draft upsert
- `GET /v1/field/view/worklist` instead of list/current
- OTP-only field auth (drop password demo)
- `media/upload-url` document flow
- Station model (SC-16)

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
| `POST /onboarding/auth/password/change` | Change password while signed in (`current_password`, `password`, `password_confirm`) |

Common errors: `invalid_credentials` (401), `account_blocked` (403), `invalid_otp` (401, optional `retries_remaining`), `rate_limited` (429), `otp_expired` (410), `activation_expired` / `reset_expired` (410).

**Demo (MSW only):** `john@jiwambe.com` / `demo12345` → OTP `123456`. Do not use in production; credentials exist only in MSW mock state.

### Token refresh

| Rule | Detail |
|------|--------|
| Where refresh runs | Auth.js `jwt` callback only (`refreshOfficerJwtIfNeeded`) |
| BFF / `upstreamRequest()` | Attaches current access token; **never** refreshes |
| Trigger | Access token within 60s of expiry (`accessTokenNeedsRefresh`) |
| Upstream | `POST /onboarding/auth/refresh` with `refresh_token` |
| Success | Rotated `access_token`, optional `refresh_token`, updated `expires_in` |
| Failure | JWT `error: RefreshError` → `proxy.ts` redirects to `/?sessionExpired=1`; BFF returns **401** |

Manual QA (MSW): set `expires_in: 1` on OTP verify, wait, then call a protected BFF route — request should still succeed after silent refresh.

---

## Officer profile

`GET /onboarding/agents/profile` (authenticated) — officer chrome, profile sheet, dealership scoping for inventory.

**Planned:** multi-location **working context** (`activeDealershipId` on upstream officer session, site picker, scoped worklist/inventory). See [`dealership-working-context-plan.md`](dealership-working-context-plan.md).

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Officer id |
| `name` | string | Display name |
| `role` | string | e.g. Field Officer |
| `dealership` | string | Display name |
| `dealershipId` | string? | For `GET /inventory?dealershipId=` |
| `phone` | string | Wire format |
| `email` | string | Login email |
| `registeredPhone` | string | Masked display |
| `nationalIdMask` | string | e.g. `•••• 1234` |
| `deviceLabel` | string | Tablet label |
| `lastSignIn` | string | Human-readable |

BFF: `GET /api/onboarding/agents/profile` → `{ profile }`. Profile is **not** stored on Auth.js session (tokens only in JWT).

Upstream enforces `assignment.officerId` / `dealershipId` on application access (403 when mismatched).

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

### Documents

Inline documents on the resource with `url`, `status` (`uploading` | `ready` | `failed` | `rejected`).

1. `POST /onboarding/applications/:id/documents/init` — body: `{ purpose, contentType, byteSize }`
2. Client **PUT** file bytes to presigned `uploadUrl` (not through BFF or Server Actions)
3. `POST /onboarding/applications/:id/documents/:documentId/complete` — returns `{ application }`

Purposes: `id_front`, `id_back`, `kra_certificate`, `selfie`, `dl_front`, `dl_back`, `pdl_document`, `dl_peleza_report`, `cogc_certificate`, `cogc_peleza_report`, `consent_document`, `business_registration`, `handover_photo`.

Capture stages upload identity, DL, COGC, and model documents via this flow (conditional on stage answers). Real presigned storage, virus scan, and OCR hooks are upstream.

### Desk queue sync

Tablet polls `GET /onboarding/applications` every **60s** (queue mode), refreshes on tab focus/visibility, and exposes a manual **Refresh worklist** control. Demo advance buttons remain for MSW demos (`TODO(prod): remove when CRM drives lifecycle`).

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

## Health (BFF-only)

`GET /api/onboarding/health` — public, unauthenticated. Used by Playwright web-server readiness and external uptime monitors.

**200 — healthy**

```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2026-07-30T17:00:00.000Z",
  "release": "abc123",
  "checks": {
    "process": "ok",
    "authConfig": "ok",
    "upstream": "skipped"
  }
}
```

**503 — degraded** — `ok: false`, `status: "degraded"` when `authConfig` or `upstream` checks fail (production with real API).

| Check | Meaning |
|-------|---------|
| `process` | Handler running |
| `authConfig` | `NEXTAUTH_SECRET` set (skipped in dev / MSW) |
| `upstream` | `skipped` when `MOCK_JIWAMBE_API=1`; otherwise probes `GET /catalog/products?limit=1` with 3s timeout |

---

## Agreement and release

Desk flows (`/desk/applications/[id]/agreement`, `…/release`) are **demo UI** with fixture data. Dedicated upstream ceremony APIs are **not** wired yet — state transitions after `LMS_CREATED` are driven by MSW seeds / CRM in production.

---

## Security (app layer)

| Control | Status |
|---------|--------|
| `Content-Security-Policy` | Shipped — tune `DOCUMENT_UPLOAD_CONNECT_SRC` for presigned storage hosts; production tightening (drop `unsafe-eval`) and nonces (drop `unsafe-inline`) planned |
| `Permissions-Policy` | Shipped — `camera=(self)` for tablet capture |
| E2E mock reset | `E2E=1`, `NODE_ENV !== production`; optional `E2E_RESET_SECRET` header |
| Open redirect guard | `sanitize-callback-url.ts` |
| CI dependency audit | Shipped — `pnpm audit --audit-level=high` in CI |
| BFF edge rate limits | **Planned** — Upstash Redis sliding window on public auth BFF routes; upstream 429 still forwarded when present |
| Client session recovery | Shipped — `bffFetch()` on protected BFF paths → sign out + `/?sessionExpired=1` |
| CSP nonces | **Planned** — per-request nonce via middleware; replace `'unsafe-inline'` on `script-src` / `style-src` for inline Next.js output |
| HSTS / WAF rate limits | Deploy layer (documented, not in repo) |

### Authorization

Protected upstream calls use `Authorization: Bearer <access_token>`. The platform API derives the officer from the token and enforces assignment / dealership scope (403 on mismatch). BFF may pass `dealershipId` as a query hint (e.g. inventory); upstream must not trust client-supplied ids over the token.

### Observability headers (BFF → upstream)

| Header | BFF today | Platform today | Planned |
|--------|-----------|----------------|---------|
| `Authorization` | Required on protected routes | Supported | — |
| `X-Request-Id` | Set on outbound [`upstreamRequest()`](../src/lib/global/shared/upstream-request.ts) | **Not supported** — no server-side request logging; forwarding may cause integration issues | Platform accepts optional id and logs it; BFF enables forward when `MOCK_JIWAMBE_API=0` and contract is live |

Until then, debug using **BFF stdout** `requestId` on `upstream_call` events only ([`ARCHITECTURE.md`](../ARCHITECTURE.md)). See [`implementation-plan.md`](implementation-plan.md#upstream-request-id-deferred).
