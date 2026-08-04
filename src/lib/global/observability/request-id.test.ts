import { describe, expect, it } from "vitest";
import {
  createRequestId,
  ensureRequestId,
  isValidRequestId,
  REQUEST_ID_HEADER,
  resolveRequestId,
  sanitizeRequestId,
} from "@/lib/global/observability/request-id";

describe("request-id", () => {
  it("preserves a valid incoming request id", () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: "req-12345678" });
    expect(resolveRequestId(headers)).toBe("req-12345678");
    expect(ensureRequestId(headers)).toBe("req-12345678");
  });

  it("rejects ids that are too short or invalid", () => {
    expect(isValidRequestId("short")).toBe(false);
    expect(isValidRequestId("bad id!")).toBe(false);
    const headers = new Headers({ [REQUEST_ID_HEADER]: "short" });
    expect(resolveRequestId(headers)).toBeUndefined();
    expect(ensureRequestId(headers)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("sanitizeRequestId generates when missing", () => {
    const id = sanitizeRequestId(undefined);
    expect(isValidRequestId(id)).toBe(true);
  });

  it("createRequestId returns a uuid", () => {
    expect(createRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
