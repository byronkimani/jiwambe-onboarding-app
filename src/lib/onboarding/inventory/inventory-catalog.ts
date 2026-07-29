import type { InventoryItem, InventoryRules } from "@/lib/onboarding/schemas/inventory-schemas";
import { INVENTORY_BIKES } from "@/lib/onboarding/fixtures/capture-fixtures";

export const DEFAULT_INVENTORY_RULES: InventoryRules = {
  softHoldMinutes: 120,
  assignableStatuses: ["available"],
  requiresInsuranceStickerForRelease: true,
  readOnly: true,
};

export function inventoryItemIdForRegistration(registration: string): string {
  return `inv_${registration.replace(/\s/g, "_").toLowerCase()}`;
}

/** Demo stock — shared by MSW and patch helpers until upstream inventory API is live. */
export function getSeedInventoryItems(): InventoryItem[] {
  return INVENTORY_BIKES.map((bike) => ({
    inventoryItemId: inventoryItemIdForRegistration(bike.reg),
    registration: bike.reg,
    model: bike.model,
    color: bike.color,
    status: bike.status === "available" ? "available" : "unavailable",
    insuranceSticker: null,
    stickerExpiry: null,
    holdAvailableUntil: null,
  }));
}

export function findInventoryItemByRegistration(
  registration: string,
): InventoryItem | undefined {
  return getSeedInventoryItems().find((item) => item.registration === registration);
}
