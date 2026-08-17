# Jiwambe Onboarding — Agent rules

**Product:** Jiwambe Onboarding (`jiwambe-onboarding-app`)  
**Spec:** [`docs/`](docs/) — incl. [`dealership-working-context-plan.md`](docs/dealership-working-context-plan.md) (planned)

## Hard rules

1. **Pure BFF** — the browser never calls `JIWAMBE_API_BASE_URL` directly. No `fetch(JIWAMBE_API_BASE_URL)` in `"use client"` files.
2. **No frontend loan or price math** — daily amounts, ownership %, and quotes are display-only from the API.
3. **`pnpm` only** — use typed `AppRoutes` from `src/lib/global/shared/routes.ts`; no hardcoded URL strings elsewhere.
4. **Tests mandatory** — happy + edge per changed function/route; mobile Playwright E2E (390×844) every phase. **`pnpm lint` must pass with zero errors and zero warnings.**
5. **No unauthorized `git commit`** — stage changes, show diff, wait for human approval before committing.
6. **Branch flow** — feature branches from `sandbox`; PRs target `sandbox`.
7. **UI / prototype parity** — [`docs/prototype/`](docs/prototype/) is **mandatory SSOT** for layout, copy, disabled states, and component structure (same design as `docs/prototype/v2/v2.html`). Cite the prototype screen + `js/*.js` function when changing UI. Update [`docs/prototype-parity.md`](docs/prototype-parity.md) checkboxes in the same PR. shadcn/ui + Tailwind 4 for app-only shells unless [`docs/overview.md`](docs/overview.md) overrides.
8. **No `NEXT_PUBLIC_*`** for secrets or upstream API URLs.
9. **English-only v1** — Kiswahili deferred until spec updates.
10. **Mock upstream** — with `MOCK_JIWAMBE_API=1`, never rely on global `fetch` patching; use the mock HTTP server in [`jiwambe-msw-server.ts`](src/mocks/jiwambe-msw-server.ts). See [`docs/local-development.md`](docs/local-development.md).
11. **Demo credentials** — [`demo-credentials.ts`](src/lib/global/auth/demo-credentials.ts) is the single source of truth; keep `README.md` and `docs/overview.md` in sync.
12. **Doc updates mandatory** — any change to MSW, instrumentation, env vars, or auth flow must update `docs/local-development.md` in the same PR.
13. **`X-Request-ID`** — BFF generates or sanitizes `X-Request-ID` per upstream doc 01 §18 (`^[A-Za-z0-9_-]{8,64}$`), echoes on every BFF response, and forwards the same value on `upstreamRequest()`. See [`request-id.ts`](src/lib/global/observability/request-id.ts).

## Commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test --run
pnpm build
pnpm test:e2e
```

## Token refresh

Refresh happens **only** in the Auth.js `jwt` callback when upstream refresh is wired. `upstreamRequest()` (when added) attaches the current token and never refreshes.
