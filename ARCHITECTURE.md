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

- **Onboarding domain:** `/onboarding/applications`, `/onboarding/auth`
- **Shared platform:** `/customers`, `/catalog`, `/inventory`, `/payments`

## Auth

- Email + password + SMS OTP ([`docs/prototype/js/auth.js`](docs/prototype/js/auth.js))
- Auth.js v5 JWT; upstream tokens server-side only
- OTP verify and token refresh **only** in server callbacks — no public BFF routes
- Route gate: [`src/proxy.ts`](src/proxy.ts)

## MSW

`MOCK_JIWAMBE_API=1` → [`src/instrumentation.ts`](src/instrumentation.ts) starts handlers in [`src/mocks/`](src/mocks/).

## Security

- No browser access to `JIWAMBE_API_BASE_URL`
- Typed [`AppRoutes`](src/lib/global/shared/routes.ts); no hardcoded API paths in client code

## Related products

| Product | Role |
|---------|------|
| `jiwambe-agents-app` | Lead referral |
| `jiwambe-rider-app` | Post-handover rider servicing (separate API) |
