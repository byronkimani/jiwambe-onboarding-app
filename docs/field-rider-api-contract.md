# Field Rider API Contract (draft)

**Status:** Author's sketch — **not** an API-team contract. All request/response shapes are assumptions to confirm before implementation.

**Upstream base:** `{JIWAMBE_API_BASE_URL}` (includes `/api/v1`)  
**Namespace:** `/riders/*`  
**BFF prefix:** `/api/onboarding/*` in this app (proxies to upstream `/riders/*` or future onboarding paths per contract)

**OpenAPI:** [`field-rider.openapi.yaml`](field-rider.openapi.yaml)

---

## 1. Authentication

### POST `/riders/auth/otp/request`

Request phone OTP.

**Request:**
```json
{ "phone": "+254700000000" }
```

**Response:**
```json
{
  "otp_session_id": "ots_…",
  "resend_available_in_seconds": 60
}
```

### POST `/riders/auth/otp/verify`

**Request:**
```json
{
  "otp_session_id": "ots_…",
  "code": "123456"
}
```

**Response:**
```json
{
  "access_token": "…",
  "refresh_token": "…",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

### POST `/riders/auth/refresh`

Non-rotating refresh token (assumption — confirm with API team).

### POST `/riders/auth/logout`

Revoke tokens.

---

## 2. Rider profile

### GET `/riders/me`

**Response:**
```json
{
  "id": "rdr_…",
  "name": "Mercy Chebet",
  "phone": "+254700000000",
  "lifecycleStage": "ACTIVE",
  "county": "Nakuru"
}
```

`lifecycleStage`: `PROSPECT` | `PENDING` | `ACTIVE` | `SUSPENDED` (assumption)

---

## 3. Catalog & quotes

### GET `/riders/catalog/products`

List financiable bikes.

**Response:**
```json
{
  "products": [
    {
      "id": "spiro-tvs",
      "label": "Spiro TVS (new)",
      "listPriceKes": 265000,
      "imageUrl": "…"
    }
  ]
}
```

### POST `/riders/catalog/quotes`

**Server-computed** daily amount and min deposit — **never computed in the browser**.

**Request:**
```json
{
  "productId": "spiro-tvs",
  "depositKes": 12000,
  "termMonths": 24,
  "operatingModel": "FLEET"
}
```

**Response:**
```json
{
  "dailyAmountKes": 510,
  "minDepositKes": 5000,
  "financedAmountKes": 253000,
  "termMonths": 24
}
```

---

## 4. Applications

### POST `/riders/applications`

Multipart or JSON — mirrors prospect form sections.

**Response:** `201` with `applicationId`, `referenceCode`, and optionally `lifecycleStage: "PENDING"` when the rider transitions out of `PROSPECT` (assumption — confirm with API team).

### GET `/riders/applications/:id`

Application status + timeline step index.

### GET `/riders/applications/current`

Current in-progress application for logged-in rider (if any). `404` when none.

**Response `200`:**

```json
{
  "applicationId": "APP-2051",
  "referenceCode": "JW-K4T9-207",
  "name": "Joseph Mwangi Kariuki",
  "firstName": "Joseph",
  "phone": "0722 118 456",
  "county": "Kiambu",
  "subCounty": "Ruiru",
  "operatingModel": "Stage",
  "submittedAt": "Fri 3 Jul 9:12am",
  "officer": "Thika field team",
  "source": "Self-service portal",
  "product": {
    "model": "Kofa R2",
    "oem": "Kofa",
    "priceKes": 194000,
    "termMonths": 24,
    "depositKes": 14000,
    "dailyAmountKes": 540
  },
  "currentStageIndex": 2,
  "events": [
    {
      "stage": "review",
      "at": "Tue 7 Jul 8:15am",
      "title": "Good conduct check started",
      "detail": "Certificate of Good Conduct being verified.",
      "by": "Jiwambe",
      "pending": true
    }
  ]
}
```

`currentStageIndex` is **0-based** against rider-facing stages: `submitted` → `released` (7 steps). `events` is the audit log grouped by `stage` in the app UI.

---

## 5. Facility (active owner)

### GET `/riders/facility`

Loan + ownership summary for Pay/Bike tabs.

```json
{
  "dailyAmountKes": 510,
  "balanceKes": 141870,
  "paidToDateKes": 44130,
  "ownershipPercent": 28,
  "arrearsDays": 0,
  "arrearsAmountKes": 0,
  "todayPaid": true,
  "termMonths": 24,
  "startDate": "2026-06-12",
  "ownershipEndDate": "2028-06-12"
}
```

---

## 6. Asset & telemetry

### GET `/riders/asset`

```json
{
  "model": "Spiro TVS",
  "registration": "KMEA 341H",
  "color": "Pine green",
  "vin": "SPTVS0092241",
  "oem": "Spiro",
  "telemetry": {
    "batteryPercent": 74,
    "odometerKm": 3820,
    "lastSeenAt": "2026-07-21T16:30:00Z",
    "locationLabel": "Nakuru CBD",
    "online": true,
    "swapsToday": 2
  }
}
```

---

## 7. Payments

### POST `/riders/payments/stk`

Initiate M-Pesa STK push.

### GET `/riders/payments`

Payment history (paginated).

---

## 8. Insurance

### GET `/riders/insurance`

Policy details for Cover tab.

---

## 9. Service

### GET `/riders/service/tickets`

Service tickets list.

### GET `/riders/service/mechanics`

Nearby mechanics (optional geo params).

### GET `/riders/service/swap-stations`

Battery swap stations.

---

## 10. Notifications & devices

### GET `/riders/notifications`

### PATCH `/riders/notifications/:id/read`

### POST `/riders/devices`

Web push device registration (portal-shaped subscription).

---

## 11. BFF mapping (this app)

| BFF route | Upstream |
|-----------|----------|
| `GET /api/rider/health` | Local only |
| `GET /api/rider/push/vapid-public-key` | `GET /riders/push/vapid-public-key` |
| `POST /api/rider/devices` | `POST /riders/devices` |
| `PATCH /api/rider/devices/:id` | `PATCH /riders/devices/:id` |
| `POST /api/rider/otp/request` | `POST /riders/auth/otp/request` |
| `POST /api/rider/otp/verify` | `POST /riders/auth/otp/verify` |
| … | Grow per phase |

---

## 12. Error codes (assumption)

| HTTP | Code | UX |
|------|------|-----|
| 401 | `otp_expired` | Re-request OTP |
| 403 | `account_suspended` | Contact support |
| 404 | `rider_not_found` | Redirect to `/apply` |

Confirm with API team.
