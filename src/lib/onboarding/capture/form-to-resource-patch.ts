import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import {
  CATALOG_PRODUCTS,
} from "@/lib/onboarding/fixtures/capture-fixtures";
import { findInventoryItemByRegistration } from "@/lib/onboarding/inventory/inventory-catalog";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import {
  createApplicationRequestSchema,
  patchApplicationRequestSchema,
} from "@/lib/onboarding/schemas/application-schemas";
import type { z } from "zod";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";

type PatchBody = z.infer<typeof patchApplicationRequestSchema>;
type CreateBody = z.infer<typeof createApplicationRequestSchema>;

export function createApplicationBodyFromForm(form: CaptureFormState): CreateBody {
  if (!isReadinessComplete(form.readiness)) {
    throw new Error("readiness incomplete");
  }
  return {
    readinessAttestations: {
      hasId: true,
      knowsKra: true,
      dlKnown: true,
      cogcKnown: true,
      hasFunds: true,
      refsBriefed: true,
    },
  };
}

function wirePhone(raw: string): string | undefined {
  const parsed = parseKenyaPhoneForSubmit(raw);
  return parsed.ok ? parsed.wire : undefined;
}

function placeholderDoc(documentId: string, url: string) {
  return {
    documentId,
    url,
    status: "ready" as const,
  };
}

export type LookupSelection = {
  leadId?: string | null;
  leadSource?: string | null;
};

export function patchBodyForStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
  version: number,
  lookup?: LookupSelection,
): Omit<PatchBody, "version"> & { version: number } | null {
  const base = { version };

  switch (stage) {
    case "readiness":
      return null;
    case "lookup":
      if (form.customerFound === "portal" && lookup?.leadId) {
        return {
          ...base,
          leadId: lookup.leadId,
          leadSource: lookup.leadSource ?? "PORTAL",
        };
      }
      if (form.customerFound === "new") {
        return { ...base, leadId: null, leadSource: "WALK_IN" };
      }
      return { ...base };
    case "identity": {
      const phone = wirePhone(form.phone);
      if (!phone) return null;
      return {
        ...base,
        customer: {
          legalName: form.name.trim(),
          phone,
          nationalId: normalizeNationalIdDigits(form.idNo),
          address: { county: form.county.trim() },
          idFront: form.idPhotoFront
            ? placeholderDoc("doc_id_front", form.idPhotoFront)
            : null,
          selfie: form.selfiePhoto
            ? placeholderDoc("doc_selfie", form.selfiePhoto)
            : null,
        },
      };
    }
    case "dl":
      return {
        ...base,
        drivingLicence: {
          licenceNumber: form.dlNumber.trim() || undefined,
          isProvisional: form.dlSituation === "pdl",
        },
      };
    case "cogc":
      return {
        ...base,
        goodConduct: {
          issuedOn: form.cogcSituation === "have" ? new Date().toISOString().slice(0, 10) : undefined,
        },
      };
    case "references":
      return {
        ...base,
        references: {
          customerConsent: form.refConsent,
          entries: form.references.map((ref) => ({
            name: ref.name.trim(),
            phone: wirePhone(ref.phone) ?? ref.phone,
            relationship: ref.relationship.trim(),
          })),
        },
      };
    case "model": {
      const type = form.opModel as "FLEET" | "STAGE" | "DELIVERY" | "PERSONAL";
      return {
        ...base,
        operatingModel: {
          type,
          fleet: type === "FLEET" ? { boltDriverActive: true } : null,
          stage: type === "STAGE" ? {} : null,
          delivery: type === "DELIVERY" ? {} : null,
          personal: type === "PERSONAL" ? {} : null,
        },
      };
    }
    case "product": {
      const product = CATALOG_PRODUCTS.find((p) => p.id === form.productId);
      return {
        ...base,
        financing: {
          productId: form.productId,
          productLabel: product?.label,
          assetCondition: form.assetType === "used" ? "used" : "new",
          termMonths: Number.parseInt(form.term, 10) || 18,
          depositKes: form.deposit,
          dailyAmountKes: form.quoteDailyKes ?? undefined,
          depositPayment: form.stkVerified
            ? { method: "stk", status: "verified" }
            : null,
        },
      };
    }
    case "bike": {
      if (!form.bikeReg) {
        return { ...base, bikeAssignment: null };
      }
      const item = findInventoryItemByRegistration(form.bikeReg);
      return {
        ...base,
        bikeAssignment: item
          ? {
              inventoryItemId: item.inventoryItemId,
              registration: item.registration,
              model: item.model,
              color: item.color,
            }
          : {
              registration: form.bikeReg,
            },
      };
    }
    case "review":
      return null;
    default:
      return null;
  }
}
