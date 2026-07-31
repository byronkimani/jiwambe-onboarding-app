import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkAuthConfig,
  checkUpstreamReachability,
  runHealthChecks,
} from "@/lib/global/observability/health-checks";

describe("health-checks", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("marks auth config skipped in development when secret missing", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(checkAuthConfig()).toBe("skipped");
  });

  it("marks auth config failed in production when secret missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(checkAuthConfig()).toBe("failed");
  });

  it("skips upstream probe when MSW is enabled", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "1");
    await expect(checkUpstreamReachability()).resolves.toBe("skipped");
  });

  it("returns ok when upstream probe succeeds", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    vi.stubEnv("JIWAMBE_API_BASE_URL", "http://127.0.0.1:18080/api/v1");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await expect(checkUpstreamReachability(fetchMock)).resolves.toBe("ok");
  });

  it("returns failed when upstream probe fails", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    vi.stubEnv("JIWAMBE_API_BASE_URL", "http://127.0.0.1:18080/api/v1");
    const fetchMock = vi.fn().mockRejectedValue(new Error("timeout"));
    await expect(checkUpstreamReachability(fetchMock)).resolves.toBe("failed");
  });

  it("runHealthChecks returns healthy when checks pass", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "1");
    vi.stubEnv("NEXTAUTH_SECRET", "secret");
    const report = await runHealthChecks(vi.fn());
    expect(report.ok).toBe(true);
    expect(report.status).toBe("healthy");
    expect(report.checks.process).toBe("ok");
    expect(report.checks.upstream).toBe("skipped");
  });

  it("runHealthChecks returns degraded when upstream fails", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXTAUTH_SECRET", "secret");
    vi.stubEnv("JIWAMBE_API_BASE_URL", "http://127.0.0.1:18080/api/v1");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
    const report = await runHealthChecks(fetchMock);
    expect(report.ok).toBe(false);
    expect(report.status).toBe("degraded");
    expect(report.checks.upstream).toBe("failed");
  });
});
