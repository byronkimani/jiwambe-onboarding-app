import { describe, expect, it } from "vitest";
import {
  isValidKenyaNationalPhone,
  parseKenyaPhoneForSubmit,
} from "./normalize-phone";

describe("normalize-phone", () => {
  it("accepts demo agent national number", () => {
    expect(isValidKenyaNationalPhone("0700100000")).toBe(true);
    expect(parseKenyaPhoneForSubmit("0700 100 000")).toEqual({
      ok: true,
      wire: "254700100000",
    });
  });

  it("rejects invalid numbers", () => {
    expect(parseKenyaPhoneForSubmit("123")).toEqual({ ok: false });
  });
});
