import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { REQUEST_ID_HEADER } from "@/lib/global/observability/request-id";

const logInfoMock = vi.fn();
const logWarnMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock("@/lib/global/observability/structured-logger", () => ({
  logInfo: (...args: unknown[]) => logInfoMock(...args),
  logWarn: (...args: unknown[]) => logWarnMock(...args),
  logError: (...args: unknown[]) => logErrorMock(...args),
}));

vi.mock("@/lib/global/shared/env", () => ({
  isMockJiwambeApiEnabled: () => false,
  getJiwambeApiBaseUrl: () => "http://upstream.test/api/v1",
}));

describe("upstreamRequest", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    logInfoMock.mockReset();
    logWarnMock.mockReset();
    logErrorMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets X-Request-Id and logs upstream_call on success", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const { upstreamRequest } = await import("@/lib/global/shared/upstream-request");

    await upstreamRequest(
      "/catalog/products",
      { method: "GET" },
      { requestId: "req-abc" },
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get(REQUEST_ID_HEADER)).toBe("req-abc");
    expect(logInfoMock).toHaveBeenCalledWith(
      "upstream_call",
      expect.objectContaining({
        event: "upstream_call",
        requestId: "req-abc",
        upstreamPath: "/catalog/products",
        method: "GET",
        status: 200,
      }),
    );
  });

  it("logs warn for upstream 4xx", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    const { upstreamRequest } = await import("@/lib/global/shared/upstream-request");

    await upstreamRequest("/missing");

    expect(logWarnMock).toHaveBeenCalledWith(
      "upstream_call",
      expect.objectContaining({ status: 404 }),
    );
  });

  it("logs info for expected auth 401", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    const { upstreamRequest } = await import("@/lib/global/shared/upstream-request");

    await upstreamRequest("/onboarding/auth/login", { method: "POST" });

    expect(logInfoMock).toHaveBeenCalledWith(
      "upstream_call",
      expect.objectContaining({ status: 401 }),
    );
    expect(logWarnMock).not.toHaveBeenCalled();
  });

  it("logs error for upstream 5xx", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    const { upstreamRequest } = await import("@/lib/global/shared/upstream-request");

    await upstreamRequest("/broken");

    expect(logErrorMock).toHaveBeenCalledWith(
      "upstream_call",
      expect.objectContaining({ status: 503 }),
    );
  });

  it("logs error when fetch throws", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const { upstreamRequest } = await import("@/lib/global/shared/upstream-request");

    await expect(upstreamRequest("/broken")).rejects.toThrow("network down");
    expect(logErrorMock).toHaveBeenCalledWith(
      "upstream_call",
      expect.objectContaining({ error: "network down", status: 0 }),
    );
  });
});
