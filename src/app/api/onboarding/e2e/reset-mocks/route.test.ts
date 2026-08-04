import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/global/shared/env", () => ({
  isE2eMode: vi.fn(),
}));

vi.mock("@/mocks/reset-all-mock-state", () => ({
  resetAllOnboardingMockState: vi.fn(),
}));

import { isE2eMode } from "@/lib/global/shared/env";
import { resetAllOnboardingMockState } from "@/mocks/reset-all-mock-state";
import { POST } from "./route";

describe("POST /api/onboarding/e2e/reset-mocks", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 when not in E2E mode", async () => {
    vi.mocked(isE2eMode).mockReturnValue(false);

    const response = await POST(new Request("http://localhost", { method: "POST" }));
    expect(response.status).toBe(404);
    expect(resetAllOnboardingMockState).not.toHaveBeenCalled();
  });

  it("returns 404 in production even when E2E mode is enabled", async () => {
    vi.mocked(isE2eMode).mockReturnValue(true);
    vi.stubEnv("NODE_ENV", "production");

    const response = await POST(new Request("http://localhost", { method: "POST" }));
    expect(response.status).toBe(404);
  });

  it("resets MSW state in E2E mode", async () => {
    vi.mocked(isE2eMode).mockReturnValue(true);
    vi.stubEnv("NODE_ENV", "test");

    const response = await POST(new Request("http://localhost", { method: "POST" }));
    expect(response.status).toBe(200);
    expect(resetAllOnboardingMockState).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("requires reset secret when configured", async () => {
    vi.mocked(isE2eMode).mockReturnValue(true);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("E2E_RESET_SECRET", "test-secret");

    const missing = await POST(new Request("http://localhost", { method: "POST" }));
    expect(missing.status).toBe(404);

    const ok = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "x-e2e-reset-secret": "test-secret" },
      }),
    );
    expect(ok.status).toBe(200);
  });
});
