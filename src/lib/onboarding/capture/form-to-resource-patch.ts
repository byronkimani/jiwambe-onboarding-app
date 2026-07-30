import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import {
  CATALOG_PRODUCTS,
} from "@/lib/onboarding/fixtures/capture-fixtures";
import { findInventoryItemByRegistration } from "@/lib/onboarding/inventory/inventory-catalog";
import { isReadinessComplete } from "@/lib/onboarding/capture/readiness";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { patchDocumentField } from "@/lib/onboarding/capture/capture-document-patch";
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

  const mapped = {
    hasId: form.readiness.hasId === true,
    knowsKra: form.readiness.knowsKra === true,
    dlKnown: form.readiness.dlKnown === true,
    cogcKnown: form.readiness.cogcKnown === true,
    hasFunds: form.readiness.hasFunds === true,
    refsBriefed: form.readiness.refsBriefed === true,
  };

  if (!Object.values(mapped).every(Boolean)) {
    throw new Error("readiness incomplete");
  }

  void mapped;

  return {
    readinessAttestations: {
      hasId: true,
      knowsKra: true,
      dlKnown: true,
      cogcKnown: true,
      hasFunds: true,
      refsBriefed: true,
      attestedAt: new Date().toISOString(),
    },
  };
}

function wirePhone(raw: string): string | undefined {
  const parsed = parseKenyaPhoneForSubmit(raw);
  return parsed.ok ? parsed.wire : undefined;
}

export type LookupSelection = {
  leadId?: string | null;
  leadSource?: string | null;
};

function operatingModelPatch(form: CaptureFormState): PatchBody["operatingModel"] {
  const type = form.opModel as "FLEET" | "STAGE" | "DELIVERY" | "PERSONAL";
  if (!type) return undefined;

  return {
    type,
    fleet:
      type === "FLEET"
        ? { boltDriverActive: form.boltActive === "yes" }
        : null,
    stage:
      type === "STAGE"
        ? {
            stageName: form.stageName.trim() || undefined,
            chairpersonName: form.chairName.trim() || undefined,
            chairpersonPhone: form.chairPhone.trim() || undefined,
            chairpersonCalled: form.chairCalled || undefined,
            callOutcome:
              form.chairOutcome === "confirmed" ||
              form.chairOutcome === "unreachable" ||
              form.chairOutcome === "denied"
                ? form.chairOutcome
                : undefined,
          }
        : null,
    delivery:
      type === "DELIVERY"
        ? {
            worksPlatform: form.worksPlatform || undefined,
            platformName: form.platformName.trim() || undefined,
            platformContact: form.platformContact.trim() || undefined,
            verifyConsent: form.verifyConsent,
            consentDocument: patchDocumentField(
              form.consentDocumentDocId,
              form.consentDocumentPhoto,
            ),
            businessRegistration: patchDocumentField(
              form.businessRegistrationDocId,
              form.businessRegistrationPhoto,
            ),
          }
        : null,
    personal:
      type === "PERSONAL"
        ? {
            isEmployed: form.isEmployed || undefined,
            employerName: form.employerName.trim() || undefined,
            employerContact: form.employerContact.trim() || undefined,
            verifyConsent: form.verifyConsent,
            consentDocument: patchDocumentField(
              form.consentDocumentDocId,
              form.consentDocumentPhoto,
            ),
            businessRegistration: patchDocumentField(
              form.businessRegistrationDocId,
              form.businessRegistrationPhoto,
            ),
          }
        : null,
  };
}

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
          kraPin: form.kraPin.trim().toUpperCase() || undefined,
          gender: form.gender.trim() || undefined,
          dateOfBirth: form.dateOfBirth.trim() || undefined,
          email: form.email.trim() || undefined,
          address: {
            county: form.county.trim(),
            subCounty: form.subCounty.trim() || undefined,
            area: form.area.trim() || undefined,
            landmark: form.landmark.trim() || undefined,
          },
          idFront: patchDocumentField(
            form.idPhotoFrontDocId,
            form.idPhotoFront,
          ),
          idBack: patchDocumentField(form.idPhotoBackDocId, form.idPhotoBack),
          kraCertificate: patchDocumentField(
            form.kraCertificateDocId,
            form.kraCertificatePhoto,
          ),
          selfie: patchDocumentField(form.selfiePhotoDocId, form.selfiePhoto),
        },
      };
    }
    case "dl":
      return {
        ...base,
        drivingLicence: {
          licenceNumber: form.dlNumber.trim() || undefined,
          isProvisional: form.dlSituation === "pdl" ? true : undefined,
          sponsorshipRequested:
            form.dlSituation === "none"
              ? form.needsSponsorship === "yes"
              : undefined,
          preferredDrivingSchool:
            form.dlSituation === "none" && form.preferredDrivingSchool.trim()
              ? form.preferredDrivingSchool.trim()
              : undefined,
          front: patchDocumentField(form.dlFrontDocId, form.dlFrontPhoto),
          back: patchDocumentField(form.dlBackDocId, form.dlBackPhoto),
          pdlDocument: patchDocumentField(
            form.pdlDocumentDocId,
            form.pdlDocumentPhoto,
          ),
          pelezaReport: patchDocumentField(
            form.dlPelezaReportDocId,
            form.dlPelezaReportPhoto,
          ),
        },
      };
    case "cogc": {
      const cogcSituation = form.cogcSituation as
        | "have"
        | "fingerprints"
        | "peleza"
        | "none"
        | "";
      return {
        ...base,
        goodConduct: {
          situation: cogcSituation || undefined,
          issuedOn:
            cogcSituation === "have"
              ? new Date().toISOString().slice(0, 10)
              : undefined,
          certificate: patchDocumentField(
            form.cogcCertificateDocId,
            form.cogcCertificatePhoto,
          ),
          pelezaReport: patchDocumentField(
            form.cogcPelezaReportDocId,
            form.cogcPelezaReportPhoto,
          ),
        },
        operations:
          cogcSituation === "fingerprints"
            ? { flag: "COGC-pending" }
            : undefined,
      };
    }
    case "references":
      return {
        ...base,
        references: {
          customerConsent: form.refConsent,
          entries: form.references.map((ref) => ({
            name: ref.name.trim(),
            phone: wirePhone(ref.phone) ?? ref.phone,
            relationship: ref.relationship.trim(),
            nationalId: ref.nationalId.trim()
              ? normalizeNationalIdDigits(ref.nationalId)
              : undefined,
            called: ref.called,
          })),
        },
      };
    case "model": {
      const operatingModel = operatingModelPatch(form);
      if (!operatingModel) return null;
      return { ...base, operatingModel };
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

/** Minimal PATCH so consent/business uploads can resolve operating model on server. */
export function patchBodyForOperatingModelType(
  form: CaptureFormState,
  version: number,
): (Omit<PatchBody, "version"> & { version: number }) | null {
  const operatingModel = operatingModelPatch(form);
  if (!operatingModel?.type) return null;
  return { version, operatingModel: { type: operatingModel.type } };
}
