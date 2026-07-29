import { describe, expect, it } from "vitest";
import {
  isValidNationalId,
  nationalIdFormatErrorMessage,
  normalizeNationalIdDigits,
} from "./national-id";

describe("national-id", () => {
  it("accepts fixture-style IDs", () => {
    expect(normalizeNationalIdDigits("2845 9912")).toBe("28459912");
    expect(isValidNationalId("2845 9912")).toBe(true);
  });

  it("rejects too short", () => {
    expect(isValidNationalId("1234")).toBe(false);
    expect(nationalIdFormatErrorMessage("1234")).toContain("valid");
  });
});
