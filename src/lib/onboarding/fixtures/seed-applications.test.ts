import { describe, expect, it } from "vitest";
import { getSeedApplications } from "./seed-applications";

describe("seed-applications", () => {
  it("includes board and in-progress demo rows", () => {
    const apps = getSeedApplications();
    expect(apps.length).toBeGreaterThanOrEqual(10);
    expect(apps.some((a) => a.state === "OPS_REVIEW")).toBe(true);
    expect(apps.some((a) => a.state === "LMS_CREATED")).toBe(true);
    expect(apps.some((a) => a.state === "READY_FOR_RELEASE")).toBe(true);
    expect(apps.filter((a) => a.state === "PAUSED").length).toBeGreaterThanOrEqual(
      4,
    );
  });
});
