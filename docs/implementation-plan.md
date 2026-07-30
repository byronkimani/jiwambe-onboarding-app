# Implementation plan (remaining work)

**Status:** Phases 0–9 **demo UI shipped** — see [`implementation-status.md`](implementation-status.md).  
**API:** [`api-contract.md`](api-contract.md) · [`api-contract.openapi.yaml`](api-contract.openapi.yaml)

## Done (no longer tracked phase-by-phase)

- Next.js PWA shell, desk, capture, agreement/release/summary demo flows
- BFF + MSW for auth, applications, customers, catalog, inventory, payments
- Playwright E2E capture journey

## Phase 10 — Upstream integration

- Point `MOCK_JIWAMBE_API=0` at staging `JIWAMBE_API_BASE_URL`
- Replace local quote/pricing fallbacks with upstream-only responses
- Wire document `init` / `complete` when backend is ready

## Phase 11 — Production hardening

- Real file upload, OCR, face match via BFF
- Remove demo worklist advance buttons; CRM-driven state
- Staging sign-off, security review, wider tablet E2E viewport

## Security pipeline (deferred — document before implement)

Track in [`implementation-status.md`](implementation-status.md). Implement in order when staging hardening starts.

| Item | Rationale | Notes |
|------|-----------|--------|
| **BFF edge rate limits** | Brute-force / abuse on public auth routes (`/api/onboarding/auth/*`) | [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted) REST on Vercel — sliding-window per IP; skip when `E2E=1`; fail open if Redis unset |
| **Client session recovery** | Idle session → protected BFF returns 401; hooks today treat as empty/error | Central `bffFetch()` on protected `/api/*` — sign out + `/?sessionExpired=1`; keep raw `fetch` on public auth + presigned PUT — **shipped** in [`bff-fetch.ts`](../src/lib/global/client/bff-fetch.ts) |
| **CSP env split** | Prod can drop `unsafe-eval`; dev needs it for Next HMR | Stricter `script-src` in production only; keep `DOCUMENT_UPLOAD_CONNECT_SRC` for presigned hosts |
| **CSP nonces** | `'unsafe-inline'` on `script-src` / `style-src` weakens XSS protection | Per-request nonce in middleware + CSP header; allow Next.js inline hydration/scripts/styles via `'nonce-…'` instead of `'unsafe-inline'` — see [Next.js CSP guide](https://nextjs.org/docs/app/guides/content-security-policy) |
| **Dependency audit in CI** | Catch high/critical CVEs before merge | `pnpm audit --audit-level=high` after install — **shipped** in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |

## Definition of done (each release)

- `pnpm lint` — zero errors and zero warnings
- `pnpm audit --audit-level=high`
- `pnpm typecheck`, `pnpm test --run`, `pnpm test:e2e`
- No `fetch(JIWAMBE_API_BASE_URL)` in `"use client"` files
- Update [`implementation-status.md`](implementation-status.md) and [`api-contract.md`](api-contract.md) when APIs change

Hard rules: [`AGENTS.md`](../AGENTS.md).
