import { describe, expect, it } from "vitest";
import { deskCardToApplicationResource } from "@/lib/onboarding/desk-card-to-application-resource";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import { getSeedApplicationById } from "@/lib/onboarding/fixtures/seed-applications";
import { mapResourceToSummary } from "./map-resource-to-summary";

describe("mapResourceToSummary", () => {
  it("maps sample resource", () => {
    const summary = mapResourceToSummary(SAMPLE_APPLICATION_RESOURCE);
    expect(summary.referenceCode).toBe("A-1042");
    expect(summary.customerDisplayName).toBe("James Mwangi Kariuki");
    expect(summary.operatingModel).toBe("FLEET");
    expect(summary.bikeRegistration).toBe("KMEB 220A");
  });

  it("maps seed card round-trip", () => {
    const card = getSeedApplicationById("A-1042");
    expect(card).toBeDefined();
    const resource = deskCardToApplicationResource(card!);
    const summary = mapResourceToSummary(resource);
    expect(summary.referenceCode).toBe("A-1042");
    expect(summary.lifecycleState).toBe("LMS_CREATED");
  });
});
