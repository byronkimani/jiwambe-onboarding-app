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
- Wire document `init` / `complete` when backend media API is ready
- **Dealership working context** — see [`dealership-working-context-plan.md`](dealership-working-context-plan.md) (multi-location officers, upstream `activeDealershipId`, login → desk sequence)

### Upstream request id (shipped)

The BFF generates or sanitizes `X-Request-ID` per upstream doc 01 §18, echoes it on every BFF response, and forwards the same value on `upstreamRequest()`. Correlate BFF `bff_request` and `upstream_call` logs by `requestId`.

| Layer | Behavior |
|-------|----------|
| `proxy.ts` | Ensures `X-Request-ID` on `/api/*` and `/v1/*` |
| `bffFetch` | Sends `X-Request-ID` from the browser when absent |
| `upstreamRequest()` | Forwards `X-Request-ID`; logs echoed upstream id when present |

## Phase 10b — Dealership locations & working context (planned)

Full spec: [`dealership-working-context-plan.md`](dealership-working-context-plan.md).

| Track | Scope |
|-------|--------|
| **Upstream** | `Location`, officer `allowedDealershipIds`, session `activeDealershipId`, `POST /agents/working-context`, scoped create/list/inventory |
| **BFF** | Mirror working-context route; profile fields; stop trusting client `dealershipId` on create |
| **UI** | Post-login site picker, chrome “Working at” chip, scoped desk/inventory |
| **E2E** | Login → pick site → desk worklist |

Blocked on product answers in plan §8 (roles, transfer rules, commission attribution).

## Phase 11 — Production hardening

- Real file upload, OCR, face match via BFF
- Remove demo worklist advance buttons; CRM-driven state
- Staging sign-off, security review, wider tablet E2E viewport

## Phase 12 — Metrics and log aggregation (Datadog or Grafana)

Structured JSON logs ship to stdout from the BFF ([`structured-logger.ts`](../src/lib/global/observability/structured-logger.ts)). Pick **one** vendor at deploy time; do not run dual APM stacks.

### Shared foundation (shipped)

- JSON logs: `service`, `env`, `release`, `requestId`, `event` (`upstream_call`, `bff_request`)
- Sentry for errors/traces ([`ARCHITECTURE.md`](../ARCHITECTURE.md))
- Public health URL for synthetics: `GET /api/onboarding/health`

### Path A — Datadog

| Layer | Setup |
|-------|--------|
| Logs | Vercel → Datadog log drain; JSON parsed automatically |
| APM | OpenTelemetry → Datadog exporter, or `@datadog/dd-trace` (evaluate bundle impact) |
| Metrics | Log-derived metrics or OTEL (BFF 5xx rate, upstream latency from `upstream_call`) |
| Synthetics | Monitor `/api/onboarding/health` every 1–5 min; alert on non-200 or `ok: false` |
| Dashboards | BFF error rate by route, upstream failures, auth 401/429 |

### Path B — Grafana Cloud

| Layer | Setup |
|-------|--------|
| Logs | Vercel drain → **Loki**; query `{service="jiwambe-onboarding-app"}` |
| Metrics | **Prometheus** remote-write from OTEL |
| Traces | **Tempo** optional; Sentry remains primary for errors |
| Synthetics | Grafana Cloud check on health URL |
| Dashboards | Loki + Prometheus panels mirroring Datadog list |

### Optional later code

- OpenTelemetry SDK wrapper around `upstreamRequest`
- `LOG_FORMAT=datadog` for trace-log correlation (`dd.trace_id`)

Keep `release` aligned with Sentry (`VERCEL_GIT_COMMIT_SHA` or `SENTRY_RELEASE`).

### Session logging (future — officer timeline debugging)

**Shipped today:** per-request `requestId` on each HTTP call; Sentry `setUser` for errors after login. That answers *“what failed on this one API call?”* — not *“what did officer Jane do across her sitting?”*

Session logging adds **officer-scoped, multi-request timelines** in structured logs (and optionally Sentry tags). No Redis/Upstash — ids pass via headers and JWT; `X-Request-ID` is forwarded to upstream (see [Upstream request id (shipped)](#upstream-request-id-shipped)).

| Tier | Goal | Implementation sketch |
|------|------|---------------------|
| **1 — Officer on logs** | Filter logs by user in a time window | Add `officerId` (and optional `dealershipId`) to every structured log line on protected BFF routes; resolve from Auth.js session in a shared helper |
| **2 — Browser session trace** | One thread id across many `bffFetch` calls until sign-out | Client generates `sessionTraceId` (UUID) after login; `bffFetch` sends `X-Session-Trace-Id`; [`proxy.ts`](../src/proxy.ts) forwards; include in `upstream_call` / `bff_request` JSON |
| **3 — Safe error codes** | Know *why* a single call failed without response bodies | On upstream 4xx, log `upstreamError` code only (e.g. `validation_failed`, `invalid_credentials`) — never passwords or PII |
| **4 — Business audit events** | Product journey (desk → capture → submit) | Explicit events: `application_opened`, `capture_stage_completed`, `submit_attempted` with `applicationRef` / stage key |
| **5 — OTEL (optional)** | Cross-service traces | OpenTelemetry spans; export via Phase 12 vendor; Sentry remains primary for user-facing errors |

**Debugging workflow (target):** Sentry → filter by officer email → note time range → logs query `{officerId, sessionTraceId}` → ordered timeline of `upstream_call` + audit events. Request ID still used to deep-link one call to upstream platform logs.

**Out of scope:** storing session timelines in Upstash; full response-body logging; replacing Sentry with Tempo for errors.

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
