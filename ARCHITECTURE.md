# Architecture — Jiwambe Onboarding

Tablet-first Next.js PWA for **onboarding agents**. Product spec: [`docs/overview.md`](docs/overview.md). API: [`docs/api-contract.md`](docs/api-contract.md) · OpenAPI [`docs/api-contract.openapi.yaml`](docs/api-contract.openapi.yaml).

## Request flow

```
Browser (PWA)
  → Next.js (RSC + client components)
  → BFF /api/* route handlers
  → upstreamRequest() + officer Bearer token
  → JIWAMBE_API_BASE_URL
```

- **Onboarding domain:** `/onboarding/applications`, `/onboarding/auth`, `/onboarding/agents`
- **Shared platform:** `/customers`, `/catalog`, `/inventory`, `/payments`

## Auth

- Email + password + SMS OTP ([`docs/prototype/js/auth.js`](docs/prototype/js/auth.js))
- Auth.js v5 JWT; upstream tokens server-side only
- OTP verify and token refresh **only** in server callbacks — no public BFF routes
- Route gate: [`src/proxy.ts`](src/proxy.ts)

## Document upload

Capture photos use **presigned direct upload** — file bytes never pass through the BFF or Server Actions:

```
PhotoSlot → POST BFF documents/init → upstream presign
         → PUT presigned uploadUrl (client → object storage)
         → POST BFF documents/complete → application resource updated
```

`serverActions.bodySizeLimit` (25 MB) is a safety net for the single sign-in Server Action only.

## MSW

`MOCK_JIWAMBE_API=1` → [`src/instrumentation-node.ts`](src/instrumentation-node.ts) starts a **mock upstream HTTP server** on `JIWAMBE_API_BASE_URL` (default `127.0.0.1:18080`) via [`src/mocks/jiwambe-msw-server.ts`](src/mocks/jiwambe-msw-server.ts). BFF routes use normal `fetch()` to that URL — no global fetch patching (Turbopack-safe).

Full local-dev guide: [`docs/local-development.md`](docs/local-development.md).

## Security

- No browser access to `JIWAMBE_API_BASE_URL`
- Typed [`AppRoutes`](src/lib/global/shared/routes.ts); no hardcoded API paths in client code
- `Content-Security-Policy` and `Permissions-Policy` in [`next.config.ts`](next.config.ts)
- Presigned storage hosts allowed via `DOCUMENT_UPLOAD_CONNECT_SRC` in CSP `connect-src`
- CI runs `pnpm audit --audit-level=high` after install (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml))
- **Deferred pipeline** (documented in [`docs/implementation-plan.md`](docs/implementation-plan.md#security-pipeline-deferred--document-before-implement)): BFF edge rate limits (Upstash Redis on public auth routes), CSP env-split for production, CSP nonces to remove `'unsafe-inline'`
- Client session recovery: [`bffFetch`](src/lib/global/client/bff-fetch.ts) on protected BFF API calls — 401 triggers sign-out and redirect to `/?sessionExpired=1`

## Observability

### Sentry (errors and traces)

- **Package:** `@sentry/nextjs` — shared options in [`src/lib/global/observability/sentry-options.ts`](src/lib/global/observability/sentry-options.ts)
- **Runtimes:** server ([`sentry.server.config.ts`](sentry.server.config.ts)), edge ([`sentry.edge.config.ts`](sentry.edge.config.ts)), client ([`instrumentation-client.ts`](instrumentation-client.ts))
- **Tunnel:** `/monitoring` via `withSentryConfig` in [`next.config.ts`](next.config.ts) — CSP `connect-src 'self'` is sufficient (no ingest host allowlist)
- **Enable rules:** off when `E2E=1` or DSN unset; on in production when DSN set; local dev requires `SENTRY_ENABLED=1`
- **User context:** `Sentry.setUser` after profile fetch in chrome context; cleared on sign-out
- **Privacy:** scrub keys matching `/password|token|authorization|otp|refresh/i`; `sendDefaultPii: false`; session replay on error only with text/media masking
- **BFF 5xx:** `bffFetch` captures server errors with `bff_path` tag (not 401/400)

### Structured logging (BFF)

- **Module:** [`structured-logger.ts`](src/lib/global/observability/structured-logger.ts) — JSON lines to stdout
- **Events:** `upstream_call` (all [`upstreamRequest`](src/lib/global/shared/upstream-request.ts) calls), `bff_request` (health and other non-upstream routes)
- **Correlation:** `X-Request-Id` set in [`proxy.ts`](src/proxy.ts) for `/api/*`; included in BFF structured logs (`upstream_call`, `bff_request`)
- **Upstream header (deferred):** the BFF currently sets `X-Request-Id` on outbound upstream `fetch()` calls ([`upstream-request.ts`](src/lib/global/shared/upstream-request.ts)). **The platform API does not support request correlation or server-side logging yet** — forwarding this header can cause integration issues. Do **not** rely on upstream echoing or logging by request id until the platform contract adds it. See [`implementation-plan.md`](docs/implementation-plan.md#upstream-request-id-deferred).
- **Today:** correlate failures using BFF stdout `requestId` only (one browser call → one BFF `upstream_call` line). Cross-service tracing waits on upstream.
- **Log levels:** auth-path 400/401/403/429 → `info`; other 4xx → `warn`; 5xx/network → `error` ([`upstream-log-level.ts`](src/lib/global/observability/upstream-log-level.ts))
- **Enable rules:** off when `E2E=1`; on in production; local dev requires `STRUCTURED_LOGGING_ENABLED=1`
- **Future:** ship stdout to Datadog Logs or Grafana Loki (Phase 12)

**Request vs session debugging (today):**

- **`requestId`** — one HTTP request (one browser `fetch`). Links BFF log lines for that call. **Not** echoed or indexed on the platform API yet.
- **Session timeline** — many requests while Jane is signed in. **Not shipped in logs yet**; use Sentry user filter for errors only.

### Session logging (future)

Planned as Phase 12 follow-on ([`implementation-plan.md`](docs/implementation-plan.md) — Session logging):

1. **`officerId` on structured logs** — query all server activity for an officer in a time window (requires log drain).
2. **`X-Session-Trace-Id`** from client `bffFetch` — one id per browser session until sign-out; threads desk/capture API calls together.
3. **Safe `upstreamError` codes** on 4xx — business reason without response bodies.
4. **Optional audit events** — capture stage / submit milestones for product-level timelines.

No Upstash or shared store — header + JWT propagation only (same model as `requestId`).

### Health / uptime

- **Endpoint:** `GET /api/onboarding/health` — public, unauthenticated
- **200:** `ok: true`, `status: "healthy"`, `checks` object
- **503:** `ok: false`, `status: "degraded"` when auth config or upstream probe fails
- **External monitor:** configure Datadog Synthetic, Grafana Cloud check, or UptimeRobot to GET health every 1–5 min; alert on non-200 or `ok: false`

### RCA runbook

1. Open Sentry → filter by **environment** (`SENTRY_ENVIRONMENT` / `VERCEL_ENV`) and **release** (`VERCEL_GIT_COMMIT_SHA` or `SENTRY_RELEASE`).
2. Search by officer **email** (user context set after login) or **dealershipId** tag.
3. For client errors, open the trace URL; for BFF failures, search messages tagged `bff_path:/api/...`.
4. For request trails, search structured logs by `requestId` or `upstreamPath` (once log drain is wired in Phase 12).
5. For officer session timelines (future), search logs by `officerId` and `sessionTraceId` — see Session logging (future) above.
6. Local smoke: set `SENTRY_ENABLED=1` + DSN in `.env.local`, trigger a dev error, confirm event with user context after login.

## Related products

| Product | Role |
|---------|------|
| `jiwambe-agents-app` | Lead referral |
| `jiwambe-rider-app` | Post-handover rider servicing (separate API) |
