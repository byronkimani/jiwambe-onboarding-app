# Contributing — Jiwambe Onboarding

## Prerequisites

- **Node 24** — see `.nvmrc`
- **pnpm 11** — `packageManager` in `package.json`. Enable Corepack: `corepack enable`

## Branching

| Branch | Role |
|--------|------|
| `main` | Production — protected |
| `sandbox` | Integration — **PRs target here** |
| `feature/*` | Short-lived branches off `sandbox` |

If the remote only has `main`, create `sandbox` from `main` before feature work.

## Workflow

1. Branch from `sandbox`
2. Implement per [`docs/implementation-plan.md`](docs/implementation-plan.md) *(when filled)*
3. Run `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm build`, `pnpm test:e2e`
4. Update [`docs/implementation-status.md`](docs/implementation-status.md)
5. Open PR to `sandbox`

## Commits

Conventional Commits. AI agents: wait for human approval before `git commit`.
