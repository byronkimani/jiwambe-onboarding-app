import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_MOCK_JIWAMBE_API_BASE_URL,
  getJiwambeApiBaseUrl,
  isE2eMode,
} from "@/lib/global/shared/env";

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("isE2eMode", () => {
  it("is true when E2E=1", () => {
    process.env.E2E = "1";
    expect(isE2eMode()).toBe(true);
  });

  it("is false when E2E unset or not 1", () => {
    delete process.env.E2E;
    expect(isE2eMode()).toBe(false);
    process.env.E2E = "0";
    expect(isE2eMode()).toBe(false);
  });
});

describe("getJiwambeApiBaseUrl", () => {
  it("returns configured URL without trailing slash", () => {
    process.env.JIWAMBE_API_BASE_URL = "https://api.example.com/api/v1/";
    delete process.env.MOCK_JIWAMBE_API;

    expect(getJiwambeApiBaseUrl()).toBe("https://api.example.com/api/v1");
  });

  it("defaults to mock base URL when MOCK_JIWAMBE_API=1 and URL unset", () => {
    delete process.env.JIWAMBE_API_BASE_URL;
    process.env.MOCK_JIWAMBE_API = "1";

    expect(getJiwambeApiBaseUrl()).toBe(DEFAULT_MOCK_JIWAMBE_API_BASE_URL);
  });

  it("throws when URL unset and mocks disabled", () => {
    delete process.env.JIWAMBE_API_BASE_URL;
    process.env.MOCK_JIWAMBE_API = "0";

    expect(() => getJiwambeApiBaseUrl()).toThrow(
      "JIWAMBE_API_BASE_URL is not configured",
    );
  });
});
