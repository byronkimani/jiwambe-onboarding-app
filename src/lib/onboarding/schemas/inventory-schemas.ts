import { z } from "zod";

export const inventoryItemStatusSchema = z.enum([
  "available",
  "held",
  "assigned",
  "unavailable",
]);

export const inventoryItemSchema = z.object({
  inventoryItemId: z.string().min(1),
  registration: z.string().min(1),
  model: z.string().min(1),
  color: z.string().min(1),
  status: inventoryItemStatusSchema,
  insuranceSticker: z.string().nullable().optional(),
  stickerExpiry: z.string().nullable().optional(),
  holdAvailableUntil: z.string().nullable().optional(),
});

export const inventoryRulesSchema = z.object({
  softHoldMinutes: z.number().int().positive(),
  assignableStatuses: z.array(inventoryItemStatusSchema).min(1),
  requiresInsuranceStickerForRelease: z.boolean(),
  readOnly: z.boolean(),
});

export const inventoryListResponseSchema = z.object({
  items: z.array(inventoryItemSchema),
  rules: inventoryRulesSchema,
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;
export type InventoryRules = z.infer<typeof inventoryRulesSchema>;
export type InventoryListResponse = z.infer<typeof inventoryListResponseSchema>;
