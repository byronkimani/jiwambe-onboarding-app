# Architecture — Jiwambe Onboarding

Tablet-first Next.js PWA for **onboarding agents**. **Current:** infra + desk/capture route shells; product SSOT in [`docs/overview.md`](docs/overview.md).

## Request flow

```
Browser (PWA on tablet)
  → Next.js RSC / client components
  → BFF route handlers (/api/onboarding/*)
  → upstreamRequest() + agent Bearer token (Phase 3+)
  → JIWAMBE_API_BASE_URL (onboarding paths per API contract)
```

## Auth

- **Email + password**, then **SMS OTP** for onboarding agents (see [`docs/prototype/js/auth.js`](docs/prototype/js/auth.js))
- **BFF:** `POST /api/onboarding/auth/login`, `otp/resend`, `activate`, `activate/password` → upstream `/onboarding/auth/*`
- **CRM activation:** one-time URL token; **httpOnly** activation session cookie; no tokens in JSON responses
- **OTP sign-in:** upstream verify inside Auth.js `authorize()` only (no handoff cookie; no public otp/verify BFF)
- Distinct from **rider** phone OTP in [`docs/field-rider-api-contract.md`](docs/field-rider-api-contract.md)
- **Auth.js v5**, JWT holds upstream tokens; refresh **only** in `jwt` callback via `POST /onboarding/auth/refresh`
- **Authenticated upstream calls:** `Authorization: Bearer` via [`upstreamRequest()`](src/lib/global/shared/upstream-request.ts)
- **429 / OTP retries:** upstream `message` (and optional `retries_remaining`) forwarded by BFF
- Route gate: [`src/proxy.ts`](src/proxy.ts)
- Edge-safe rules in [`src/auth.config.ts`](src/auth.config.ts)

**Public paths:** `/`, `/activate`, `/offline`, `/account-blocked`, `/api/auth/*`, public `GET/POST /api/onboarding/auth/*`, `GET /api/onboarding/health`  
**Protected:** `/desk`, `/desk/*`, `/capture`, `/capture/*`, other authenticated BFF

## Agent flows (target)

| Area | Routes |
|------|--------|
| Desk | `/desk`, `/desk/history`, `/desk/drafts` |
| Capture | `/capture/[stage]` — readiness through review |

## MSW

`MOCK_JIWAMBE_API=1` → [`src/instrumentation.ts`](src/instrumentation.ts) starts MSW ([`src/mocks/`](src/mocks/)).

## PWA

- Manifest: **Jiwambe Onboarding**, `#123E31`
- Service worker stub: [`public/sw.js`](public/sw.js)

## Security

- No direct browser access to `JIWAMBE_API_BASE_URL`
- Response headers in [`next.config.ts`](next.config.ts)

## Related products

- **jiwambe-rider-app** — rider self-service after handover
- **jiwambe-agents-app** — field referrals
- [`docs/portal-migration.md`](docs/portal-migration.md) — customer portal → **rider app**, not this repo
