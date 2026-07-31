import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  getSentryDsn,
  isSentryEnabled,
} from "@/lib/global/observability/sentry-options";

describe("sentry-options", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled when E2E is set", () => {
    vi.stubEnv("E2E", "1");
    vi.stubEnv("SENTRY_DSN", "https://example@o0.ingest.sentry.io/0");
    vi.stubEnv("NODE_ENV", "production");
    expect(isSentryEnabled()).toBe(false);
  });

  it("is disabled when DSN is missing", () => {
    vi.stubEnv("SENTRY_DSN", "");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(isSentryEnabled()).toBe(false);
  });

  it("is enabled in production when DSN is set", () => {
    vi.stubEnv("SENTRY_DSN", "https://example@o0.ingest.sentry.io/0");
    vi.stubEnv("NODE_ENV", "production");
    expect(isSentryEnabled()).toBe(true);
  });

  it("requires SENTRY_ENABLED in development", () => {
    vi.stubEnv("SENTRY_DSN", "https://example@o0.ingest.sentry.io/0");
    vi.stubEnv("NODE_ENV", "development");
    expect(isSentryEnabled()).toBe(false);
    vi.stubEnv("SENTRY_ENABLED", "1");
    expect(isSentryEnabled()).toBe(true);
  });

  it("reads client DSN from NEXT_PUBLIC_SENTRY_DSN", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@o0.ingest.sentry.io/0");
    expect(getSentryDsn(true)).toBe("https://public@o0.ingest.sentry.io/0");
  });
});
