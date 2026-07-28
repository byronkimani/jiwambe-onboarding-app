# Jiwambe Onboarding

Tablet-first [Next.js](https://nextjs.org) PWA for **onboarding agents** at Jiwambe offices and partner dealerships: in-person KYC, capture, deposit, agreement, and bike handover. After release, riders use **jiwambe-rider-app** for servicing.

The browser talks only to this app’s BFF under `/api/onboarding/*` (see [`src/lib/global/shared/routes.ts`](src/lib/global/shared/routes.ts)).

**Specs:** [`docs/overview.md`](docs/overview.md) · [`docs/implementation-plan.md`](docs/implementation-plan.md) · [`docs/implementation-status.md`](docs/implementation-status.md)

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

Open [http://localhost:3000](http://localhost:3000). With `MOCK_JIWAMBE_API=1` (default in the example), outbound API calls use [MSW](https://mswjs.io/) when handlers are added.

**Demo sign-in:** any valid email and password (8+ characters) → OTP **`123456`** → desk. Example email: `jane.ochieng@contractor.jiwambe.com`, password: `demopass1`.

**UX reference:** [`docs/prototype/`](docs/prototype/) (serve statically for full field-tablet flows).

### Compare to prototype

Side-by-side UI check (tablet **1024×768**):

1. Open [`docs/prototype/prototype.html`](docs/prototype/prototype.html) in a browser (or `npx serve docs/prototype`).
2. Run `pnpm dev` and sign in with the demo OTP above.
3. Match desk kraft folders, agreement/release flows, and capture stages against the prototype modules in [`docs/prototype/js/`](docs/prototype/js/).

E2E uses the **tablet** Playwright project first (`playwright.config.ts`); mobile is a secondary smoke viewport.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JIWAMBE_API_BASE_URL` | Deploy | Upstream root **including** `/api/v1` — **server only** |
| `MOCK_JIWAMBE_API` | Local/CI | Set `1` to enable MSW |
| `NEXTAUTH_SECRET` | Phase 3+ | Session signing |
| `NEXTAUTH_URL` | Phase 3+ | App origin |
| `E2E` | Playwright only | `1` for E2E — **never** in production |

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test --run
pnpm test:e2e
pnpm test:all
```

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui · Vitest · Playwright · MSW · Auth.js (Phase 3)

## License

Private — Jiwambe.
