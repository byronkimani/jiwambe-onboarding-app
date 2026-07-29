import type { InventoryRules } from "@/lib/onboarding/schemas/inventory-schemas";
import {
  getSeedInventoryItems,
  DEFAULT_INVENTORY_RULES,
} from "@/lib/onboarding/inventory/inventory-catalog";

export { DEFAULT_INVENTORY_RULES };

export function listInventoryItems(_dealershipId?: string | null) {
  return getSeedInventoryItems();
}

export function getInventoryRules(): InventoryRules {
  return { ...DEFAULT_INVENTORY_RULES };
}
