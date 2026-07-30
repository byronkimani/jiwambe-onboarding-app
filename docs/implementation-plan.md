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

## Definition of done (each release)

- `pnpm lint` — zero errors and zero warnings
- `pnpm typecheck`, `pnpm test --run`, `pnpm test:e2e`
- No `fetch(JIWAMBE_API_BASE_URL)` in `"use client"` files
- Update [`implementation-status.md`](implementation-status.md) and [`api-contract.md`](api-contract.md) when APIs change

Hard rules: [`AGENTS.md`](../AGENTS.md).
