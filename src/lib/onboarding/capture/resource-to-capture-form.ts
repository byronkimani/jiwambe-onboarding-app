import { formatKenyanPhoneDisplay } from "@/lib/global/auth/normalize-phone";
import { CATALOG_PRODUCTS } from "@/lib/onboarding/fixtures/capture-fixtures";
import { READINESS_ITEMS } from "@/lib/onboarding/capture/stages";
import type { CaptureFormState } from "@/lib/onboarding/capture/types";
import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import { createEmptyCaptureForm } from "@/lib/onboarding/capture/types";

function readinessFromResource(
  resource: OnboardingApplicationResource,
): Partial<Record<string, boolean>> {
  const attest = resource.readinessAttestations;
  if (attest) {
    const out: Partial<Record<string, boolean>> = {};
    for (const item of READINESS_ITEMS) {
      const key = item.k;
      out[key] = Boolean(attest[key as keyof typeof attest]);
    }
    return out;
  }
  if (
    resource.lifecycleState === "DRAFT" ||
    resource.lifecycleState === "PAUSED"
  ) {
    const allTrue: Partial<Record<string, boolean>> = {};
    for (const item of READINESS_ITEMS) {
      allTrue[item.k] = true;
    }
    return allTrue;
  }
  return {};
}

function customerFoundFromResource(
  resource: OnboardingApplicationResource,
): CaptureFormState["customerFound"] {
  if (resource.leadSource === "PORTAL" && resource.leadId) {
    return "portal";
  }
  if (resource.leadSource === "WALK_IN") {
    return "new";
  }
  if (resource.customer?.legalName) {
    return resource.leadId ? "portal" : "new";
  }
  return null;
}

function cogcSituationFromResource(
  resource: OnboardingApplicationResource,
): string {
  const gc = resource.goodConduct;
  if (gc?.certificate || gc?.issuedOn) return "have";
  return "";
}

function dlSituationFromResource(resource: OnboardingApplicationResource): string {
  const dl = resource.drivingLicence;
  if (!dl?.licenceNumber && !dl?.isProvisional) return "";
  if (dl.isProvisional) return "pdl";
  return "have";
}

function productIdFromFinancing(
  financing: OnboardingApplicationResource["financing"],
): string {
  if (financing?.productId) return financing.productId;
  const label = financing?.productLabel;
  if (!label) return "";
  const match = CATALOG_PRODUCTS.find(
    (p) => p.label === label || label.startsWith(p.label),
  );
  return match?.id ?? "";
}

/** Maps API resource → capture wizard form (resume / conflict recovery). */
export function hydrateCaptureFormFromResource(
  resource: OnboardingApplicationResource,
): CaptureFormState {
  const base = createEmptyCaptureForm();
  const customer = resource.customer;
  const refs = resource.references?.entries ?? [];
  const referenceRows = base.references.map((row, index) => {
    const entry = refs[index];
    if (!entry) return row;
    return {
      name: entry.name ?? "",
      phone: entry.phone ? formatKenyanPhoneDisplay(entry.phone) : "",
      relationship: entry.relationship ?? "",
    };
  });

  return {
    ...base,
    readiness: readinessFromResource(resource),
    customerFound: customerFoundFromResource(resource),
    selectedLeadId: resource.leadId ?? null,
    selectedLeadSource: resource.leadSource ?? null,
    name: customer?.legalName ?? "",
    phone: customer?.phone ? formatKenyanPhoneDisplay(customer.phone) : "",
    idNo: customer?.nationalId ?? "",
    county: customer?.address?.county ?? "",
    idPhotoFront: customer?.idFront?.url ?? null,
    selfiePhoto: customer?.selfie?.url ?? null,
    dlSituation: dlSituationFromResource(resource),
    dlNumber: resource.drivingLicence?.licenceNumber ?? "",
    cogcSituation: cogcSituationFromResource(resource),
    references: referenceRows,
    refConsent: resource.references?.customerConsent ?? false,
    opModel: resource.operatingModel?.type ?? "",
    assetType:
      resource.financing?.assetCondition === "used" ? "used" : "new",
    productId: productIdFromFinancing(resource.financing),
    term: String(resource.financing?.termMonths ?? base.term),
    deposit: resource.financing?.depositKes ?? base.deposit,
    quoteMinDepositKes: null,
    quoteDailyKes: resource.financing?.dailyAmountKes ?? null,
    bikeReg: resource.bikeAssignment?.registration ?? null,
    stkVerified: resource.financing?.depositPayment?.status === "verified",
    stkState:
      resource.financing?.depositPayment?.status === "verified"
        ? "confirmed"
        : "idle",
    stkCheckoutId: null,
    stkRef: resource.financing?.depositPayment?.mpesaReceipt ?? null,
    fallbackCode: "",
  };
}
