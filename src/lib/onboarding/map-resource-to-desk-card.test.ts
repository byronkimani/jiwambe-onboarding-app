import { describe, expect, it } from "vitest";
import { deskCardToApplicationResource } from "@/lib/onboarding/desk-card-to-application-resource";
import { SAMPLE_APPLICATION_RESOURCE } from "@/lib/onboarding/fixtures/sample-application-resource";
import { getSeedApplicationById } from "@/lib/onboarding/fixtures/seed-applications";
import {
  mapResourceToDeskCard,
  mapSummaryToDeskCard,
} from "@/lib/onboarding/map-resource-to-desk-card";

describe("map-resource-to-desk-card", () => {
  it("round-trips A-1042 seed card through resource shape", () => {
    const card = getSeedApplicationById("A-1042");
    expect(card).toBeDefined();
    const resource = deskCardToApplicationResource(card!);
    const mapped = mapResourceToDeskCard(resource);
    expect(mapped.id).toBe("A-1042");
    expect(mapped.name).toBe(card!.name);
    expect(mapped.state).toBe("LMS_CREATED");
    expect(mapped.daily).toBe(510);
  });

  it("maps sample resource to desk card", () => {
    const card = mapResourceToDeskCard(SAMPLE_APPLICATION_RESOURCE);
    expect(card.id).toBe("A-1042");
    expect(card.name).toBe("James Mwangi Kariuki");
    expect(card.bike?.reg).toBe("KMEB 220A");
  });

  it("maps list summary to desk card", () => {
    const card = mapSummaryToDeskCard({
      id: "app_x",
      referenceCode: "A-2000",
      lifecycleState: "DRAFT",
      customerDisplayName: "Test User",
      updatedAt: "2026-07-29T00:00:00Z",
    });
    expect(card.state).toBe("DRAFT");
    expect(card.name).toBe("Test User");
  });

  it("includes document URLs on resource from desk card", () => {
    const card = getSeedApplicationById("A-1042");
    const resource = deskCardToApplicationResource(card!);
    expect(resource.goodConduct?.certificate?.url).toContain("cogc");
    expect(resource.customer?.idFront?.url).toBeTruthy();
  });
});
