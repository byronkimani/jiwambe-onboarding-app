import { describe, expect, it } from "vitest";
import {
  createRequestId,
  ensureRequestId,
  REQUEST_ID_HEADER,
  resolveRequestId,
} from "@/lib/global/observability/request-id";

describe("request-id", () => {
  it("preserves an incoming request id", () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: "req-123" });
    expect(resolveRequestId(headers)).toBe("req-123");
    expect(ensureRequestId(headers)).toBe("req-123");
  });

  it("generates a request id when missing", () => {
    const headers = new Headers();
    const id = ensureRequestId(headers);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("createRequestId returns a uuid", () => {
    expect(createRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
