import { describe, expect, it } from "vitest";
import {
  isDraftState,
  isHistoryState,
  isLiveDeskState,
  lifelineIndex,
  primaryActionForState,
} from "./application-helpers";

describe("application-helpers", () => {
  it("maps lifeline index for LMS_CREATED", () => {
    expect(lifelineIndex("LMS_CREATED")).toBe(3);
  });

  it("returns primary action for actionable states", () => {
    expect(primaryActionForState("LMS_CREATED")).toBe("agreement");
    expect(primaryActionForState("READY_FOR_RELEASE")).toBe("release");
    expect(primaryActionForState("OPS_REVIEW")).toBeNull();
  });

  it("partitions desk lists", () => {
    expect(isLiveDeskState("OPS_REVIEW")).toBe(true);
    expect(isDraftState("PAUSED")).toBe(true);
    expect(isHistoryState("ACTIVE_LOAN")).toBe(true);
  });
});
