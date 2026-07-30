import { describe, expect, it } from "vitest";
import {
  isValidKenyaNationalPhone,
  parseKenyaPhoneForSubmit,
  resolveKenyaPhoneWire,
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

  it("resolves wire MSISDN from BFF-normalized phone", () => {
    expect(resolveKenyaPhoneWire("254712334556")).toBe("254712334556");
    expect(resolveKenyaPhoneWire("0712 334 556")).toBe("254712334556");
    expect(resolveKenyaPhoneWire("invalid")).toBeNull();
  });
});
