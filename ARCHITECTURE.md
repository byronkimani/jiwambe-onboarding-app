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

## Auth (Phase 3+)

- **Phone + password** for onboarding agents (not rider phone-OTP)
- **Auth.js v5**, JWT session, upstream tokens server-side only
- Token refresh **only** in the Auth.js `jwt` callback
- Route gate: [`src/proxy.ts`](src/proxy.ts)
- Edge-safe rules in [`src/auth.config.ts`](src/auth.config.ts)

**Public paths:** `/`, `/offline`, `/account-blocked`, `/api/auth/*`, `GET /api/onboarding/health`  
**Protected:** `/desk`, `/desk/*`, `/capture`, `/capture/*`, authenticated BFF (gate enforced Phase 3+)

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
