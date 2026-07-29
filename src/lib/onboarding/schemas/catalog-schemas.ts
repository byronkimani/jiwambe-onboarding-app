import { z } from "zod";

export const catalogProductSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  listPriceKes: z.number().int().nonnegative(),
  assetCondition: z.enum(["new", "used"]).optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const catalogProductsResponseSchema = z.object({
  products: z.array(catalogProductSchema),
});

export type CatalogProduct = z.infer<typeof catalogProductSchema>;
