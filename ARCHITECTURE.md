# Architecture — Jiwambe Onboarding

Tablet-first Next.js PWA for **onboarding agents**. Product spec: [`docs/overview.md`](docs/overview.md). API: [`docs/api-contract.md`](docs/api-contract.md) · OpenAPI [`docs/api-contract.openapi.yaml`](docs/api-contract.openapi.yaml).

## Request flow

```
Browser (PWA)
  → Next.js (RSC + client components)
  → BFF /api/* route handlers
  → upstreamRequest() + officer Bearer token
  → JIWAMBE_API_BASE_URL
```

- **Onboarding domain:** `/onboarding/applications`, `/onboarding/auth`, `/onboarding/agents`
- **Shared platform:** `/customers`, `/catalog`, `/inventory`, `/payments`

## Auth

- Email + password + SMS OTP ([`docs/prototype/js/auth.js`](docs/prototype/js/auth.js))
- Auth.js v5 JWT; upstream tokens server-side only
- OTP verify and token refresh **only** in server callbacks — no public BFF routes
- Route gate: [`src/proxy.ts`](src/proxy.ts)

## Document upload

Capture photos use **presigned direct upload** — file bytes never pass through the BFF or Server Actions:

```
PhotoSlot → POST BFF documents/init → upstream presign
         → PUT presigned uploadUrl (client → object storage)
         → POST BFF documents/complete → application resource updated
```

`serverActions.bodySizeLimit` (25 MB) is a safety net for the single sign-in Server Action only.

## MSW

`MOCK_JIWAMBE_API=1` → [`src/instrumentation.ts`](src/instrumentation.ts) starts handlers in [`src/mocks/`](src/mocks/).

## Security

- No browser access to `JIWAMBE_API_BASE_URL`
- Typed [`AppRoutes`](src/lib/global/shared/routes.ts); no hardcoded API paths in client code
- `Content-Security-Policy` and `Permissions-Policy` in [`next.config.ts`](next.config.ts)
- Presigned storage hosts allowed via `DOCUMENT_UPLOAD_CONNECT_SRC` in CSP `connect-src`
- CI runs `pnpm audit --audit-level=high` after install (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml))
- **Deferred pipeline** (documented in [`docs/implementation-plan.md`](docs/implementation-plan.md#security-pipeline-deferred--document-before-implement)): BFF edge rate limits (Upstash Redis on public auth routes), CSP env-split for production, CSP nonces to remove `'unsafe-inline'`
- Client session recovery: [`bffFetch`](src/lib/global/client/bff-fetch.ts) on protected BFF API calls — 401 triggers sign-out and redirect to `/?sessionExpired=1`

## Related products

| Product | Role |
|---------|------|
| `jiwambe-agents-app` | Lead referral |
| `jiwambe-rider-app` | Post-handover rider servicing (separate API) |
