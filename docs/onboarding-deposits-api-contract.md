# Onboarding deposits API contract (draft)

**BFF prefix:** `/api/onboarding/deposits/*`  
**Upstream:** `/onboarding/deposits/*`

Deposit verification is **server-authoritative** — the tablet displays status from the API and PATCHes `financing.depositPayment` on the application after validate returns `verified`.

---

## POST `/onboarding/deposits/stk`

Initiate M-Pesa STK push for an in-progress application deposit.

**Request:**

```json
{
  "applicationReferenceCode": "A-2001",
  "depositKes": 10000,
  "phone": "+254712334556"
}
```

**Response `200`:**

```json
{
  "checkoutId": "ws_CO_demo_abc",
  "status": "waiting",
  "expiresAt": "2026-07-29T15:00:00Z"
}
```

---

## POST `/onboarding/deposits/validate`

Confirm STK (poll by `checkoutId`) or validate an M-Pesa confirmation code (fallback).

**Request (STK poll):**

```json
{
  "applicationReferenceCode": "A-2001",
  "checkoutId": "ws_CO_demo_abc"
}
```

**Request (M-Pesa code fallback):**

```json
{
  "applicationReferenceCode": "A-2001",
  "mpesaReceipt": "UGE2ETEST01"
}
```

**Response `200`:**

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

On **verified**, upstream (demo MSW) updates the application resource `financing.depositPayment` and increments `version`.

**Statuses:** `verified` | `pending` | `failed`

---

## BFF mapping

| BFF | Upstream |
|-----|----------|
| `POST /api/onboarding/deposits/stk` | `POST /onboarding/deposits/stk` |
| `POST /api/onboarding/deposits/validate` | `POST /onboarding/deposits/validate` |
