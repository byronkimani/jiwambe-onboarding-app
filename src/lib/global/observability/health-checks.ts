import {
  getJiwambeApiBaseUrl,
  isMockJiwambeApiEnabled,
} from "@/lib/global/shared/env";
import { getSentryRelease } from "@/lib/global/observability/sentry-options";
import { ensureJiwambeMsw } from "@/mocks/jiwambe-msw-server";

export type HealthCheckStatus = "ok" | "failed" | "skipped";

export type HealthChecks = {
  process: HealthCheckStatus;
  authConfig: HealthCheckStatus;
  upstream: HealthCheckStatus;
};

export type HealthReport = {
  ok: boolean;
  status: "healthy" | "degraded";
  timestamp: string;
  release?: string;
  checks: HealthChecks;
};

const UPSTREAM_PROBE_TIMEOUT_MS = 3000;

export function checkAuthConfig(): HealthCheckStatus {
  if (process.env.NEXTAUTH_SECRET?.trim()) {
    return "ok";
  }
  if (
    process.env.NODE_ENV === "development" ||
    isMockJiwambeApiEnabled()
  ) {
    return "skipped";
  }
  return "failed";
}

async function probeUpstreamUrl(
  url: string,
  fetchImpl: typeof fetch,
): Promise<HealthCheckStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_PROBE_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return response.ok ? "ok" : "failed";
  } catch {
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkUpstreamReachability(
  fetchImpl: typeof fetch = fetch,
): Promise<HealthCheckStatus> {
  if (isMockJiwambeApiEnabled()) {
    try {
      await ensureJiwambeMsw();
    } catch {
      return "failed";
    }
  }

  const base = getJiwambeApiBaseUrl();
  const url = `${base}/v1/field/products?limit=1`;
  return probeUpstreamUrl(url, fetchImpl);
}

export async function runHealthChecks(
  fetchImpl: typeof fetch = fetch,
): Promise<HealthReport> {
  const checks: HealthChecks = {
    process: "ok",
    authConfig: checkAuthConfig(),
    upstream: await checkUpstreamReachability(fetchImpl),
  };

  const criticalFailed =
    checks.authConfig === "failed" || checks.upstream === "failed";
  const ok = !criticalFailed;

  return {
    ok,
    status: ok ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    release: getSentryRelease(),
    checks,
  };
}
