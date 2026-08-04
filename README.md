# Jiwambe Onboarding

Tablet-first [Next.js](https://nextjs.org) PWA for **onboarding agents** at Jiwambe offices and partner dealerships: in-person KYC, capture, deposit, agreement, and bike handover. After release, riders use **jiwambe-rider-app** for servicing.

The browser talks only to this app’s BFF under `/api/onboarding/*` (see [`src/lib/global/shared/routes.ts`](src/lib/global/shared/routes.ts)).

**Specs:** [`docs/overview.md`](docs/overview.md) · [`docs/api-contract.md`](docs/api-contract.md) · [`docs/api-contract.openapi.yaml`](docs/api-contract.openapi.yaml) · [`docs/implementation-status.md`](docs/implementation-status.md)

**Contributing / agent rules:** [`AGENTS.md`](AGENTS.md) · **Architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md)

## Prerequisites

- **Node.js** ≥ 24
- **pnpm** ≥ 11.13 (`packageManager` in `package.json`)

## Quick start

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). With `MOCK_JIWAMBE_API=1` (default in the example), the BFF calls a local mock upstream on `127.0.0.1:18080` — see [`docs/local-development.md`](docs/local-development.md).

**Demo sign-in:** `john@jiwambe.com` / `demo12345` → OTP **`123456`** → desk. Credentials are defined in [`src/lib/global/auth/demo-credentials.ts`](src/lib/global/auth/demo-credentials.ts).

**Reset mock state after QA:** `pnpm dev:reset-mocks` (or restart `pnpm dev`).

**UX reference:** [`docs/prototype/`](docs/prototype/) (serve statically for full field-tablet flows).

### Compare to prototype

Side-by-side UI check (tablet **1024×768**):

1. Open [`docs/prototype/prototype.html`](docs/prototype/prototype.html) in a browser (or `npx serve docs/prototype`).
2. Run `pnpm dev` and sign in with the demo OTP above.
3. Match desk kraft folders, agreement/release flows, and capture stages against the prototype modules in [`docs/prototype/js/`](docs/prototype/js/).

E2E: **tablet** project for `shell.spec.ts`; **mobile-chrome** (390×844) for `capture-journey.spec.ts` per `AGENTS.md`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIWAMBE_API_BASE_URL` | Deploy | Upstream host root (e.g. `https://api.jiwambe.co.ke`) — **server only** |
| `MOCK_JIWAMBE_API` | Local/CI | Set `1` to enable MSW |
| `NEXTAUTH_SECRET` | Phase 3+ | Session signing |
| `NEXTAUTH_URL` | Phase 3+ | App origin |
| `E2E` | Playwright only | `1` for E2E — **never** in production |

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint          # must pass with zero errors and zero warnings
pnpm typecheck
pnpm test --run
pnpm test:e2e
pnpm test:all
```

`pnpm test:e2e` frees port **3100** (local only), then starts the E2E dev server and runs Playwright. Do not run `pnpm dev` on 3100 in another terminal at the same time.

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui · Vitest · Playwright · MSW · Auth.js (Phase 3)

## License

Private — Jiwambe.
