import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import { CATALOG_PRODUCTS } from "@/lib/onboarding/fixtures/capture-fixtures";
import { findInventoryItemByRegistration } from "@/lib/onboarding/inventory/inventory-catalog";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import type { patchApplicationRequestSchema } from "@/lib/onboarding/schemas/application-schemas";
import type { z } from "zod";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";
import type { LookupSelection } from "@/lib/onboarding/capture/form-to-resource-patch";

type PatchBody = z.infer<typeof patchApplicationRequestSchema>;

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

/** Best-effort partial PATCH for pause — no stage completion validation. */
export function draftPatchBodyForStage(
  stage: CaptureStageKey,
  form: CaptureFormState,
  version: number,
  lookup?: LookupSelection,
): (Omit<PatchBody, "version"> & { version: number }) | null {
  const base = { version };

  switch (stage) {
    case "readiness":
    case "review":
      return null;
    case "lookup": {
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
      return null;
    }
    case "identity": {
      const customer: NonNullable<PatchBody["customer"]> = {};
      if (form.name.trim()) customer.legalName = form.name.trim();
      const phone = wirePhone(form.phone);
      if (phone) customer.phone = phone;
      const nid = normalizeNationalIdDigits(form.idNo);
      if (nid) customer.nationalId = nid;
      if (form.county.trim()) {
        customer.address = { county: form.county.trim() };
      }
      if (form.idPhotoFront) {
        customer.idFront = placeholderDoc("doc_id_front", form.idPhotoFront);
      }
      if (form.selfiePhoto) {
        customer.selfie = placeholderDoc("doc_selfie", form.selfiePhoto);
      }
      if (Object.keys(customer).length === 0) return null;
      return { ...base, customer };
    }
    case "dl": {
      if (!form.dlSituation && !form.dlNumber.trim()) return null;
      return {
        ...base,
        drivingLicence: {
          licenceNumber: form.dlNumber.trim() || undefined,
          isProvisional: form.dlSituation === "pdl" ? true : undefined,
        },
      };
    }
    case "cogc": {
      if (!form.cogcSituation) return null;
      return {
        ...base,
        goodConduct: {
          issuedOn:
            form.cogcSituation === "have"
              ? new Date().toISOString().slice(0, 10)
              : undefined,
        },
      };
    }
    case "references": {
      const entries = form.references
        .map((ref) => {
          const name = ref.name.trim();
          const relationship = ref.relationship.trim();
          const phoneWire = wirePhone(ref.phone);
          if (!name && !relationship && !phoneWire) return null;
          if (!name || !relationship || !phoneWire) return null;
          return { name, phone: phoneWire, relationship };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null);
      if (entries.length === 0 && !form.refConsent) return null;
      return {
        ...base,
        references: {
          customerConsent: form.refConsent,
          entries,
        },
      };
    }
    case "model": {
      if (!form.opModel) return null;
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
      if (!form.productId && !form.stkVerified) return null;
      const product = CATALOG_PRODUCTS.find((p) => p.id === form.productId);
      const financing: NonNullable<PatchBody["financing"]> = {};
      if (form.productId) {
        financing.productId = form.productId;
        financing.productLabel = product?.label;
      }
      if (form.assetType) {
        financing.assetCondition = form.assetType === "used" ? "used" : "new";
      }
      const termMonths = Number.parseInt(form.term, 10);
      if (termMonths) financing.termMonths = termMonths;
      if (form.deposit) financing.depositKes = form.deposit;
      if (form.stkVerified) {
        financing.depositPayment = { method: "stk", status: "verified" };
      }
      if (Object.keys(financing).length === 0) return null;
      return { ...base, financing };
    }
    case "bike": {
      if (!form.bikeReg) return null;
      const item = findInventoryItemByRegistration(form.bikeReg);
      if (!item) return null;
      return {
        ...base,
        bikeAssignment: {
          inventoryItemId: item.inventoryItemId,
          registration: item.registration,
          model: item.model,
          color: item.color,
        },
      };
    }
    default:
      return null;
  }
}
