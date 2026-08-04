import { describe, expect, it, vi, beforeEach } from "vitest";
import { REQUEST_ID_HEADER } from "@/lib/global/observability/request-id";

const logBffRequestMock = vi.fn();

vi.mock("@/lib/global/observability/log-bff-request", () => ({
  logBffRequest: (...args: unknown[]) => logBffRequestMock(...args),
}));

describe("runBffRoute", () => {
  beforeEach(() => {
    logBffRequestMock.mockReset();
  });

  it("logs bff_request and echoes X-Request-ID", async () => {
    const { runBffRoute } = await import("@/lib/global/observability/bff-route");
    const request = new Request("http://localhost/v1/field/products", {
      headers: { [REQUEST_ID_HEADER]: "req-test-12345" },
    });

    const response = await runBffRoute(request, "/v1/field/products", async () =>
      Response.json({ ok: true }, { status: 200 }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("req-test-12345");
    expect(logBffRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        route: "/v1/field/products",
        status: 200,
      }),
    );
  });
});
