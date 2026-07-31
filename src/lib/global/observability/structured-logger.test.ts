import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isStructuredLoggingEnabled,
  logError,
  logInfo,
  logWarn,
} from "@/lib/global/observability/structured-logger";

describe("structured-logger", () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    logSpy.mockClear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled when E2E is set", () => {
    vi.stubEnv("E2E", "1");
    vi.stubEnv("NODE_ENV", "production");
    expect(isStructuredLoggingEnabled()).toBe(false);
    logInfo("test");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("is enabled in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isStructuredLoggingEnabled()).toBe(true);
  });

  it("requires STRUCTURED_LOGGING_ENABLED in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(isStructuredLoggingEnabled()).toBe(false);
    vi.stubEnv("STRUCTURED_LOGGING_ENABLED", "1");
    expect(isStructuredLoggingEnabled()).toBe(true);
  });

  it("emits JSON with service and scrubs sensitive fields", () => {
    vi.stubEnv("NODE_ENV", "production");
    logInfo("upstream_call", {
      event: "upstream_call",
      password: "secret",
      status: 200,
    });

    expect(logSpy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
    expect(payload.service).toBe("jiwambe-onboarding-app");
    expect(payload.level).toBe("info");
    expect(payload.msg).toBe("upstream_call");
    expect(payload.password).toBe("[Filtered]");
    expect(payload.status).toBe(200);
  });

  it("respects LOG_LEVEL warn", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LOG_LEVEL", "warn");
    logInfo("ignored");
    logWarn("visible");
    logError("also visible");

    expect(logSpy).toHaveBeenCalledTimes(2);
  });
});
