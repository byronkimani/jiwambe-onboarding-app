import type { z } from "zod";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import {
  applicationListResponseSchema,
  applicationResourceResponseSchema,
  customerLookupResponseSchema,
  onboardingApplicationResourceSchema,
} from "@/lib/onboarding/schemas/application-schemas";
import { inventoryListResponseSchema } from "@/lib/onboarding/schemas/inventory-schemas";
import { catalogProductsResponseSchema } from "@/lib/onboarding/schemas/catalog-schemas";
import {
  depositStkResponseSchema,
  depositValidateResponseSchema,
} from "@/lib/onboarding/schemas/deposit-schemas";

export type ParseOk<T> = { ok: true; data: T };
export type ParseFail = { ok: false; status: 502 };

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  json: unknown,
): ParseOk<T> | ParseFail {
  const result = schema.safeParse(json);
  if (!result.success) {
    return { ok: false, status: 502 };
  }
  return { ok: true, data: result.data };
}

export function parseApplicationResource(
  json: unknown,
): ParseOk<OnboardingApplicationResource> | ParseFail {
  const wrapped = parseWithSchema(applicationResourceResponseSchema, json);
  if (!wrapped.ok) {
    const direct = parseWithSchema(onboardingApplicationResourceSchema, json);
    if (direct.ok) {
      return direct;
    }
    return wrapped;
  }
  return { ok: true, data: wrapped.data.application };
}

export function parseApplicationListResponse(json: unknown) {
  return parseWithSchema(applicationListResponseSchema, json);
}

export function parseCustomerLookupResponse(json: unknown) {
  return parseWithSchema(customerLookupResponseSchema, json);
}

export function parseInventoryListResponse(json: unknown) {
  return parseWithSchema(inventoryListResponseSchema, json);
}

export function parseCatalogProductsResponse(json: unknown) {
  return parseWithSchema(catalogProductsResponseSchema, json);
}

export function parseDepositStkResponse(json: unknown) {
  return parseWithSchema(depositStkResponseSchema, json);
}

export function parseDepositValidateResponse(json: unknown) {
  return parseWithSchema(depositValidateResponseSchema, json);
}
