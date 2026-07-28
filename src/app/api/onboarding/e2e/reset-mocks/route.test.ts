import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/global/shared/env", () => ({
  isE2eMode: vi.fn(),
}));

vi.mock("@/mocks/officer-auth-mock-state", () => ({
  resetOfficerAuthMockState: vi.fn(),
}));

import { isE2eMode } from "@/lib/global/shared/env";
import { resetOfficerAuthMockState } from "@/mocks/officer-auth-mock-state";
import { POST } from "./route";

describe("POST /api/onboarding/e2e/reset-mocks", () => {
  it("returns 404 when not in E2E mode", async () => {
    vi.mocked(isE2eMode).mockReturnValue(false);

    const response = await POST();
    expect(response.status).toBe(404);
    expect(resetOfficerAuthMockState).not.toHaveBeenCalled();
  });

  it("resets MSW officer auth state in E2E mode", async () => {
    vi.mocked(isE2eMode).mockReturnValue(true);

    const response = await POST();
    expect(response.status).toBe(200);
    expect(resetOfficerAuthMockState).toHaveBeenCalledOnce();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
