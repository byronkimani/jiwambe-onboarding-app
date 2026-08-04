import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
} from "@/lib/global/auth/demo-credentials";
import {
  ensureJiwambeMsw,
  resetJiwambeMockHttpServerForTests,
} from "@/mocks/jiwambe-msw-server";

describe("ensureJiwambeMsw", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetJiwambeMockHttpServerForTests();
  });

  afterEach(() => {
    resetJiwambeMockHttpServerForTests();
    vi.unstubAllEnvs();
  });

  it("starts a mock HTTP server that serves officer login", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "1");
    vi.stubEnv("JIWAMBE_API_BASE_URL", "http://127.0.0.1:18081");

    await ensureJiwambeMsw();

    const response = await fetch(
      "http://127.0.0.1:18081/v1/_demo/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: DEMO_AGENT_EMAIL,
          password: DEMO_AGENT_PASSWORD,
        }),
      },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { otp_session_id?: string };
    expect(body.otp_session_id).toMatch(/^ots_/);
  });

  it("is a no-op when MOCK_JIWAMBE_API is disabled", async () => {
    vi.stubEnv("MOCK_JIWAMBE_API", "0");
    await expect(ensureJiwambeMsw()).resolves.toBeUndefined();
  });
});
