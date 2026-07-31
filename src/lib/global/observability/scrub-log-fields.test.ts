import { describe, expect, it } from "vitest";
import { scrubLogFields } from "@/lib/global/observability/scrub-log-fields";

describe("scrubLogFields", () => {
  it("redacts sensitive keys", () => {
    expect(
      scrubLogFields({
        email: "a@b.com",
        password: "secret123",
        authorization: "Bearer x",
      }),
    ).toEqual({
      email: "a@b.com",
      password: "[Filtered]",
      authorization: "[Filtered]",
    });
  });

  it("truncates long strings", () => {
    expect(scrubLogFields("x".repeat(201))).toBe("[Filtered]");
  });
});
