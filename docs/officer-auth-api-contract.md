# Officer auth API contract (draft)

**Status:** Draft for onboarding agents — confirm with API / CRM teams before production.

**Not** the rider phone OTP flow in [`field-rider-api-contract.md`](field-rider-api-contract.md).

**Upstream base:** `{JIWAMBE_API_BASE_URL}` (includes `/api/v1`)  
**BFF prefix:** `/api/onboarding/auth/*` in this app

All **non-auth** onboarding upstream calls require `Authorization: Bearer <access_token>`.

---

## POST `/onboarding/auth/login`

Validates email + password. On success, starts a **short-lived** SMS OTP challenge.

**Request:**

```json
{ "email": "john@jiwambe.com", "password": "…" }
```

**Response (200):**

```json
{
  "otp_session_id": "ots_…",
  "masked_phone": "07•• ••• 118",
  "resend_available_in_seconds": 60
}
```

**Errors:**

| Status | `error` | Notes |
|--------|---------|--------|
| 401 | `invalid_credentials` | Optional `message` for display |
| 403 | `account_blocked` | |
| 429 | `rate_limited` | **`message`** from upstream (show in UI); optional `retry_after_seconds` |

---

## POST `/onboarding/auth/otp/verify`

**Request:**

```json
{ "otp_session_id": "ots_…", "code": "123456" }
```

**Response (200):**

```json
{
  "access_token": "…",
  "refresh_token": "…",
  "expires_in": 3600,
  "officer": { "email": "…", "name": "…" }
}
```

**Errors:**

| Status | Notes |
|--------|--------|
| 401 | `invalid_otp` — optional `message`, **`retries_remaining`** |
| 429 | Rate limited — **`message`** from upstream |

**BFF:** OTP verify runs **only** inside Auth.js `authorize()` during `signIn` (server action passes `email`, `otp_session_id`, and `code`). There is **no** public `/api/onboarding/auth/otp/verify` route — upstream is called server-to-server once per sign-in attempt. Codes are **single-use** (must not verify twice).

---

## POST `/onboarding/auth/otp/resend`

Resends the SMS code for an existing OTP session.

**Request:**

```json
{ "otp_session_id": "ots_…" }
```

**Response (200):**

```json
{
  "resend_available_in_seconds": 60,
  "message": "…"
}
```

**Errors:**

| Status | `error` | Notes |
|--------|---------|--------|
| 410 | `otp_expired` | Session invalid — sign in again |
| 429 | `rate_limited` | **`message`** from upstream |

**BFF:** `POST /api/onboarding/auth/otp/resend`

---

## POST `/onboarding/auth/logout`

Revokes the officer refresh token (idempotent if already revoked).

**Request:**

```json
{ "refresh_token": "…" }
```

**Response (200):** `{ "ok": true }`

**BFF:** `POST /api/onboarding/logout` — requires Auth.js session; refresh token read server-side from JWT.

---

## POST `/onboarding/auth/refresh`

Used **only** by the Next.js Auth.js `jwt` callback (server-side).

**Request:**

```json
{ "refresh_token": "…" }
```

**Response (200):**

```json
{
  "access_token": "…",
  "refresh_token": "…",
  "expires_in": 3600
}
```

**Errors:** `401 invalid_refresh` → session `RefreshError`, user sent to login.

---

## POST `/onboarding/auth/activate`

Validates CRM **one-time** activation token from the magic link.

**Request:**

```json
{ "token": "…" }
```

**Upstream response (200):** includes `activation_session_id` and `email_masked`.

**BFF response (200):** `{ "email_masked": "…" }` only — `activation_session_id` stored in an **httpOnly** cookie.

**Errors:** `410 activation_expired` (token used or expired)

---

## POST `/onboarding/auth/activate/password`

**Upstream request:**

```json
{
  "activation_session_id": "act_…",
  "password": "…"
}
```

**BFF request:** `{ "password": "…", "password_confirm": "…" }` — session id read from httpOnly cookie.

**Response:** `{ "ok": true }` — does **not** create a browser session; agent signs in at `/`.

---

## POST `/onboarding/auth/password/forgot`

Self-service password reset request. Upstream sends a **magic link** email when the account exists.

**Request:**

```json
{ "email": "john@jiwambe.com" }
```

**Response (200):** Same body whether or not the email is registered (no account enumeration), e.g. `{ "message": "…" }`.

**Errors:**

| Status | Notes |
|--------|--------|
| 429 | Rate limited — **`message`** from upstream; BFF forwards to the client |

**BFF:** `POST /api/onboarding/auth/password/forgot` — normalizes email; returns **200** with generic copy on upstream success; forwards **429**; returns **502** when upstream is unavailable (does not imply email was sent).

---

## POST `/onboarding/auth/password/reset`

Validates the **one-time** token from the reset magic link.

**Request:**

```json
{ "token": "…" }
```

**Upstream response (200):** includes `reset_session_id` and `email_masked`.

**BFF response (200):** `{ "email_masked": "…" }` only — `reset_session_id` stored in an **httpOnly** cookie (separate from activation).

**Errors:** `410 reset_expired` (token used or expired)

**BFF:** `POST /api/onboarding/auth/password/reset`

---

## POST `/onboarding/auth/password/reset/password`

**Upstream request:**

```json
{
  "reset_session_id": "rst_…",
  "password": "…"
}
```

**BFF request:** `{ "password": "…", "password_confirm": "…" }` — session id read from httpOnly cookie.

**Response:** `{ "ok": true }` — does **not** create a browser session; agent signs in at `/` with **email + password + SMS OTP**.

**BFF:** `POST /api/onboarding/auth/password/reset/password`

---

## Security notes

- OTP `otp_session_id` values are short-lived (upstream TTL).
- Activation and password-reset URL tokens are **single-use**; avoid logging query strings.
- Reset links use the same httpOnly session pattern as activation so tokens are not held in client storage after the first BFF POST.
- After OTP verify, upstream tokens are written **only** to the Auth.js session JWT (server-side). No custom staging cookie between verify and session.
- OTP brute-force limits and **`retries_remaining`** are enforced upstream; `authorize()` maps failures to structured errors surfaced by the login server action.
