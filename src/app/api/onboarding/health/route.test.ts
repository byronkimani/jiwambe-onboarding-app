import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const runHealthChecksMock = vi.fn();
const logBffRequestMock = vi.fn();

vi.mock("@/lib/global/observability/health-checks", () => ({
  runHealthChecks: (...args: unknown[]) => runHealthChecksMock(...args),
}));

vi.mock("@/lib/global/observability/log-bff-request", () => ({
  logBffRequest: (...args: unknown[]) => logBffRequestMock(...args),
}));

describe("GET /api/onboarding/health", () => {
  beforeEach(() => {
    runHealthChecksMock.mockReset();
    logBffRequestMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 200 when healthy", async () => {
    runHealthChecksMock.mockResolvedValue({
      ok: true,
      status: "healthy",
      timestamp: "2026-07-30T17:00:00.000Z",
      checks: { process: "ok", authConfig: "ok", upstream: "skipped" },
    });

    const response = await GET(new Request("http://localhost/api/onboarding/health"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true, status: "healthy" });
    expect(logBffRequestMock).toHaveBeenCalled();
  });

  it("returns 503 when degraded", async () => {
    runHealthChecksMock.mockResolvedValue({
      ok: false,
      status: "degraded",
      timestamp: "2026-07-30T17:00:00.000Z",
      checks: { process: "ok", authConfig: "failed", upstream: "skipped" },
    });

    const response = await GET(new Request("http://localhost/api/onboarding/health"));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ ok: false, status: "degraded" });
  });
});
