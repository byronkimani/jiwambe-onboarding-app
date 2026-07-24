# Jiwambe Onboarding — Agent rules

**Product:** Jiwambe Onboarding (`jiwambe-onboarding-app`)  
**Spec:** [`docs/`](docs/)

## Hard rules

1. **Pure BFF** — the browser never calls `JIWAMBE_API_BASE_URL` directly. No `fetch(JIWAMBE_API_BASE_URL)` in `"use client"` files.
2. **No frontend loan or price math** — daily amounts, ownership %, and quotes are display-only from the API.
3. **`pnpm` only** — use typed `AppRoutes` from `src/lib/global/shared/routes.ts`; no hardcoded URL strings elsewhere.
4. **Tests mandatory** — happy + edge per changed function/route; mobile Playwright E2E (390×844) every phase.
5. **No unauthorized `git commit`** — stage changes, show diff, wait for human approval before committing.
6. **Branch flow** — feature branches from `sandbox`; PRs target `sandbox`.
7. **UI** — shadcn/ui + Tailwind 4; follow [`docs/prototype/`](docs/prototype/) unless [`docs/overview.md`](docs/overview.md) overrides.
8. **No `NEXT_PUBLIC_*`** for secrets or upstream API URLs.
9. **English-only v1** — Kiswahili deferred until spec updates.

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

When Auth.js ships (Phase 2), refresh happens **only** in the `jwt` callback. `upstreamRequest()` attaches the current token and never refreshes.
