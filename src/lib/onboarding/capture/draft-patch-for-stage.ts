import type { CaptureStageKey } from "@/lib/global/shared/routes";
import { parseKenyaPhoneForSubmit } from "@/lib/global/auth/normalize-phone";
import { CATALOG_PRODUCTS } from "@/lib/onboarding/fixtures/capture-fixtures";
import { findInventoryItemByRegistration } from "@/lib/onboarding/inventory/inventory-catalog";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import { patchDocumentField } from "@/lib/onboarding/capture/capture-document-patch";
import type { LookupSelection } from "@/lib/onboarding/capture/form-to-resource-patch";
import type { patchApplicationRequestSchema } from "@/lib/onboarding/schemas/application-schemas";
import type { z } from "zod";
import { normalizeNationalIdDigits } from "@/lib/onboarding/validation/national-id";

type PatchBody = z.infer<typeof patchApplicationRequestSchema>;

function wirePhone(raw: string): string | undefined {
  const parsed = parseKenyaPhoneForSubmit(raw);
  return parsed.ok ? parsed.wire : undefined;
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
      if (form.kraPin.trim()) customer.kraPin = form.kraPin.trim().toUpperCase();
      if (form.county.trim()) {
        customer.address = { county: form.county.trim() };
      }
      const idFront = patchDocumentField(
        form.idPhotoFrontDocId,
        form.idPhotoFront,
      );
      if (idFront) customer.idFront = idFront;
      const idBack = patchDocumentField(form.idPhotoBackDocId, form.idPhotoBack);
      if (idBack) customer.idBack = idBack;
      const kraCertificate = patchDocumentField(
        form.kraCertificateDocId,
        form.kraCertificatePhoto,
      );
      if (kraCertificate) customer.kraCertificate = kraCertificate;
      const selfie = patchDocumentField(form.selfiePhotoDocId, form.selfiePhoto);
      if (selfie) customer.selfie = selfie;
      if (Object.keys(customer).length === 0) return null;
      return { ...base, customer };
    }
    case "dl": {
      if (!form.dlSituation && !form.dlNumber.trim()) return null;
      const drivingLicence: NonNullable<PatchBody["drivingLicence"]> = {};
      if (form.dlNumber.trim()) {
        drivingLicence.licenceNumber = form.dlNumber.trim();
      }
      if (form.dlSituation === "pdl") drivingLicence.isProvisional = true;
      const front = patchDocumentField(form.dlFrontDocId, form.dlFrontPhoto);
      if (front) drivingLicence.front = front;
      const back = patchDocumentField(form.dlBackDocId, form.dlBackPhoto);
      if (back) drivingLicence.back = back;
      const pdlDocument = patchDocumentField(
        form.pdlDocumentDocId,
        form.pdlDocumentPhoto,
      );
      if (pdlDocument) drivingLicence.pdlDocument = pdlDocument;
      const pelezaReport = patchDocumentField(
        form.dlPelezaReportDocId,
        form.dlPelezaReportPhoto,
      );
      if (pelezaReport) drivingLicence.pelezaReport = pelezaReport;
      return { ...base, drivingLicence };
    }
    case "cogc": {
      if (!form.cogcSituation) return null;
      const goodConduct: NonNullable<PatchBody["goodConduct"]> = {};
      if (form.cogcSituation === "have") {
        goodConduct.issuedOn = new Date().toISOString().slice(0, 10);
      }
      const certificate = patchDocumentField(
        form.cogcCertificateDocId,
        form.cogcCertificatePhoto,
      );
      if (certificate) goodConduct.certificate = certificate;
      const pelezaReport = patchDocumentField(
        form.cogcPelezaReportDocId,
        form.cogcPelezaReportPhoto,
      );
      if (pelezaReport) goodConduct.pelezaReport = pelezaReport;
      return { ...base, goodConduct };
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
      const operatingModel: NonNullable<PatchBody["operatingModel"]> = {
        type,
        fleet: type === "FLEET" ? { boltDriverActive: true } : null,
        stage: type === "STAGE" ? {} : null,
        delivery:
          type === "DELIVERY"
            ? {
                worksPlatform: form.worksPlatform || undefined,
                platformName: form.platformName.trim() || undefined,
                platformContact: form.platformContact.trim() || undefined,
                verifyConsent: form.verifyConsent || undefined,
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
                verifyConsent: form.verifyConsent || undefined,
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
      return { ...base, operatingModel };
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
