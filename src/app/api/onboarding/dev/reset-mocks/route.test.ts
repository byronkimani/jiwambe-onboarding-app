import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/mocks/reset-all-mock-state", () => ({
  resetAllOnboardingMockState: vi.fn(),
}));

import { resetAllOnboardingMockState as resetMock } from "@/mocks/reset-all-mock-state";
import { POST } from "@/app/api/onboarding/dev/reset-mocks/route";

describe("POST /api/onboarding/dev/reset-mocks", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(resetMock).mockReset();
  });

  it("returns 404 in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOCK_JIWAMBE_API", "1");
    const response = await POST();
    expect(response.status).toBe(404);
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("returns 404 when MSW is disabled", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    const response = await POST();
    expect(response.status).toBe(404);
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("resets mock state in local development with MOCK=1", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_JIWAMBE_API", "1");
    const response = await POST();
    expect(response.status).toBe(200);
    expect(resetMock).toHaveBeenCalledOnce();
  });
});
