import type { InventoryRules } from "@/lib/onboarding/schemas/inventory-schemas";
import {
  getSeedInventoryItems,
  DEFAULT_INVENTORY_RULES,
} from "@/lib/onboarding/inventory/inventory-catalog";

export { DEFAULT_INVENTORY_RULES };

export function listInventoryItems(dealershipId?: string | null) {
  void dealershipId;
  return getSeedInventoryItems();
}

export function getInventoryRules(): InventoryRules {
  return { ...DEFAULT_INVENTORY_RULES };
}
