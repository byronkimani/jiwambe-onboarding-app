# Onboarding applications API contract (draft)

**Status:** Draft — officer field capture and worklist. Confirm with API / CRM before production.

**Related:** [`officer-auth-api-contract.md`](officer-auth-api-contract.md) (auth), [`field-rider-api-contract.md`](field-rider-api-contract.md) (rider self-serve sketch).

**Upstream base:** `{JIWAMBE_API_BASE_URL}` (includes `/api/v1`)  
**BFF prefix:** `/api/onboarding/*` in this app

Authenticated routes require `Authorization: Bearer <access_token>` unless noted.

**Capture wizard:** UI-only step order (`/capture/[stage]` or `/desk/applications/[id]/capture/[stage]`). The API stores a **single application resource** with domain properties; there are **no `stages` keys** in the JSON.

**Money and quotes:** Daily installment, min deposit, and financed amount are **server-computed** — display only in the app ([`AGENTS.md`](../AGENTS.md)).

---

## Document object

Files live **inline** on the application (customer, driving licence, good conduct, etc.). Each document includes a **read URL** (CDN or short-lived signed URL) for tablet preview.

```json
{
  "documentId": "doc_07",
  "url": "https://cdn.example.com/…/cogc.pdf",
  "contentType": "application/pdf",
  "fileName": "cogc.pdf",
  "byteSize": 245000,
  "uploadedAt": "2026-07-29T06:20:00Z",
  "status": "ready"
}
```

| `status` | Meaning |
|----------|---------|
| `uploading` | Init recorded; bytes not verified |
| `ready` | Available at `url` |
| `failed` | Upload or scan failed |
| `rejected` | Policy / virus scan rejected |

**Upload flow (presigned):**

1. `POST /onboarding/applications/:id/documents/init` — `{ "purpose": "id_front", "contentType": "image/jpeg", "byteSize": 1200000 }`
2. Response: `{ "documentId", "uploadUrl", "uploadHeaders", "expiresAt" }` — client PUTs to object storage
3. `POST /onboarding/applications/:id/documents/:documentId/complete`
4. On `GET` application, nested `Document` includes **`url`** for display

Suggested max sizes: images **8 MB**, PDF **8 MB**, selfie **5 MB**; reject non-image/PDF types.

**Face match:** After selfie + ID upload, upstream may set `customer.faceMatchScore` (0–1) and `customer.faceMatchPassed`. Display only; not computed in the browser.

---

## Application resource

### Lifecycle states

| `lifecycleState` | Meaning |
|------------------|---------|
| `DRAFT` | In progress; multiple drafts per officer allowed |
| `PAUSED` | Officer paused; optional `pause.reason`; bike hold may be released upstream |
| `OPS_REVIEW` | Submitted to operations |
| `LMS_CREATED` | Approved; agreement flow |
| `AGREEMENT_SIGNED` | Agreement signed |
| `READY_FOR_RELEASE` | Handover |
| `ACTIVE_LOAN` | Complete |
| `DISQUALIFIED` | Terminal |

### Full example

Canonical fixture: [`src/lib/onboarding/fixtures/sample-application-resource.ts`](../src/lib/onboarding/fixtures/sample-application-resource.ts).

`operatingModel.type`: `FLEET` | `STAGE` | `DELIVERY` | `PERSONAL` — only the matching branch object is populated.

<details>
<summary>Example JSON (abbreviated)</summary>

See `SAMPLE_APPLICATION_RESOURCE` in the fixture file for a complete `LMS_CREATED` example with document `url` fields on `customer`, `drivingLicence`, and `goodConduct.certificate`.

</details>

---

## Endpoints

### POST `/onboarding/applications`

Create after **readiness** attestations (officer present).

**Request:**

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

**Response:** `201` — full application resource (`lifecycleState`: `DRAFT`).

### GET `/onboarding/applications`

Worklist / history / drafts.

| Query | Result |
|-------|--------|
| *(none)* | **Officer queue** — `OPS_REVIEW`, `LMS_CREATED`, `AGREEMENT_SIGNED`, `READY_FOR_RELEASE` only (excludes `DRAFT`, `PAUSED`, `DISQUALIFIED`, `ACTIVE_LOAN`) |
| `lifecycleState=DRAFT` or `PAUSED` | Drafts / paused captures |
| `scope=history` | `DISQUALIFIED` and `ACTIVE_LOAN` |

**Response:** `{ "applications": OnboardingApplicationSummary[] }`

Summaries include desk-friendly fields (`officerDisplayName`, `dealershipName`, `termMonths`, `lmsId`, `financedAmountKes`, `nationalIdMasked`) for list cards; open folder detail still uses `GET :id` for full data.

### GET `/onboarding/applications/current`

Most recently updated `DRAFT` or `PAUSED` application for the authenticated officer (demo MSW: `assignment.officerId` matches session officer).

**Response:** `200` — `{ "application": OnboardingApplicationResource }`  
**Response:** `404` — no open capture application

### GET `/onboarding/applications/:id`

Full application resource.

### PATCH `/onboarding/applications/:id`

Partial update — any top-level property groups. Returns full resource.

**Request must include `version`** (current resource version). Mismatch returns `409` (`version_conflict`). BFF and MSW validate request/response JSON with Zod ([`application-schemas.ts`](../src/lib/onboarding/schemas/application-schemas.ts)).

### POST `/onboarding/applications/:id/pause` · `…/disqualify` · `…/submit`

Lifecycle transitions per tables above. Submit returns `422` with `blockingIssues` when invalid.

**Pause request:**

```json
{ "reason": "Customer stepped out to fetch KRA certificate" }
```

**Submit request:** `{}` or `{ "officerAttestation": true }` — transitions `DRAFT`/`PAUSED` → `OPS_REVIEW` when valid.

**Submit response `422`:**

```json
{
  "error": "validation_failed",
  "blockingIssues": [{ "code": "identity.phone", "message": "Phone is required." }]
}
```

**Disqualify request:** same shape as pause (`reason` min 6 chars). Allowed only from `DRAFT` or `PAUSED` — **not** after submit (`OPS_REVIEW`+). See [`onboarding-disqualify-rules.md`](onboarding-disqualify-rules.md).

**Pause response:** `200` — full application resource with `lifecycleState`: `PAUSED`, `pause.reason` set, and bike hold cleared upstream (demo MSW clears `bikeAssignment`).

### GET `/onboarding/inventory`

Read-only dealership stock for bike assignment. Optional query: `dealershipId`.

**Response:** `{ "items": InventoryItem[] }` — see [`inventory-schemas.ts`](../src/lib/onboarding/schemas/inventory-schemas.ts).

### POST `/onboarding/customers/lookup`

```json
{ "phone": "+254722118456", "nationalId": null }
```

**Response:** `{ "matches": [{ "leadId", "source", "displayName", "phoneMasked", "nationalIdMasked" }] }`

### POST `/onboarding/catalog/quotes`

Server-computed quote; client updates `financing` via PATCH.

### Documents

- `POST /onboarding/applications/:id/documents/init`
- `POST /onboarding/applications/:id/documents/:documentId/complete`

---

## BFF mapping (this app)

| BFF | Upstream |
|-----|----------|
| `GET/POST/PATCH /api/onboarding/applications` | `/onboarding/applications` |
| `GET /api/onboarding/applications/current` | `/onboarding/applications/current` |
| `GET /api/onboarding/applications/:id` | `/onboarding/applications/:id` |
| `POST /api/onboarding/applications/:id/pause` | `/onboarding/applications/:id/pause` |
| `POST /api/onboarding/applications/:id/submit` | `/onboarding/applications/:id/submit` |
| `POST /api/onboarding/applications/:id/disqualify` | `/onboarding/applications/:id/disqualify` |
| `POST /api/onboarding/customers/lookup` | `/onboarding/customers/lookup` |
| `GET /api/onboarding/inventory` | `/onboarding/inventory` |
| `POST /api/onboarding/catalog/quotes` | `/onboarding/catalog/quotes` |

Desk worklist cards ([`OnboardingApplication`](../src/lib/onboarding/types.ts)) are a **UI projection** — [`map-resource-to-desk-card.ts`](../src/lib/onboarding/map-resource-to-desk-card.ts).
