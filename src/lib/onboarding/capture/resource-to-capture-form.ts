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
  if (gc?.situation) return gc.situation;
  if (resource.operations?.flag === "COGC-pending") return "fingerprints";
  if (gc?.certificate || gc?.issuedOn) return "have";
  if (gc?.pelezaReport) return "peleza";
  return "";
}

function dlSituationFromResource(resource: OnboardingApplicationResource): string {
  const dl = resource.drivingLicence;
  if (!dl) return "";
  if (dl.sponsorshipRequested) return "none";
  if (dl.pdlDocument || dl.isProvisional) return "pdl";
  if (dl.pelezaReport) return "processing";
  if (dl.front || dl.back || dl.licenceNumber) {
    if (dl.front && !dl.back && !dl.pelezaReport) {
      return dl.isProvisional ? "pdl" : "processing";
    }
    return "smart";
  }
  return "";
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

function consentFromOperatingModel(
  resource: OnboardingApplicationResource,
): { photo: string | null; docId: string | null } {
  const om = resource.operatingModel;
  const doc =
    om?.delivery?.consentDocument ?? om?.personal?.consentDocument ?? null;
  return { photo: doc?.url ?? null, docId: doc?.documentId ?? null };
}

function businessRegFromOperatingModel(
  resource: OnboardingApplicationResource,
): { photo: string | null; docId: string | null } {
  const om = resource.operatingModel;
  const doc =
    om?.delivery?.businessRegistration ??
    om?.personal?.businessRegistration ??
    null;
  return { photo: doc?.url ?? null, docId: doc?.documentId ?? null };
}

/** Maps API resource → capture wizard form (resume / conflict recovery). */
export function hydrateCaptureFormFromResource(
  resource: OnboardingApplicationResource,
): CaptureFormState {
  const base = createEmptyCaptureForm();
  const customer = resource.customer;
  const dl = resource.drivingLicence;
  const gc = resource.goodConduct;
  const om = resource.operatingModel;
  const refs = resource.references?.entries ?? [];
  const referenceRows = base.references.map((row, index) => {
    const entry = refs[index];
    if (!entry) return row;
    return {
      name: entry.name ?? "",
      phone: entry.phone ? formatKenyanPhoneDisplay(entry.phone) : "",
      relationship: entry.relationship ?? "",
      nationalId: entry.nationalId ?? "",
      called: entry.called ?? false,
    };
  });
  const consent = consentFromOperatingModel(resource);
  const businessReg = businessRegFromOperatingModel(resource);
  const fleetActive = om?.fleet?.boltDriverActive;

  return {
    ...base,
    readiness: readinessFromResource(resource),
    customerFound: customerFoundFromResource(resource),
    selectedLeadId: resource.leadId ?? null,
    selectedLeadSource: resource.leadSource ?? null,
    name: customer?.legalName ?? "",
    phone: customer?.phone ? formatKenyanPhoneDisplay(customer.phone) : "",
    idNo: customer?.nationalId ?? "",
    kraPin: customer?.kraPin ?? "",
    gender: customer?.gender ?? "",
    dateOfBirth: customer?.dateOfBirth ?? "",
    email: customer?.email ?? "",
    county: customer?.address?.county ?? "",
    subCounty: customer?.address?.subCounty ?? "",
    area: customer?.address?.area ?? "",
    landmark: customer?.address?.landmark ?? "",
    idPhotoFront: customer?.idFront?.url ?? null,
    idPhotoFrontDocId: customer?.idFront?.documentId ?? null,
    idPhotoBack: customer?.idBack?.url ?? null,
    idPhotoBackDocId: customer?.idBack?.documentId ?? null,
    kraCertificatePhoto: customer?.kraCertificate?.url ?? null,
    kraCertificateDocId: customer?.kraCertificate?.documentId ?? null,
    selfiePhoto: customer?.selfie?.url ?? null,
    selfiePhotoDocId: customer?.selfie?.documentId ?? null,
    dlSituation: dlSituationFromResource(resource),
    dlNumber: dl?.licenceNumber ?? "",
    needsSponsorship: dl?.sponsorshipRequested ? "yes" : "",
    preferredDrivingSchool: dl?.preferredDrivingSchool ?? "",
    dlFrontPhoto: dl?.front?.url ?? null,
    dlFrontDocId: dl?.front?.documentId ?? null,
    dlBackPhoto: dl?.back?.url ?? null,
    dlBackDocId: dl?.back?.documentId ?? null,
    pdlDocumentPhoto: dl?.pdlDocument?.url ?? null,
    pdlDocumentDocId: dl?.pdlDocument?.documentId ?? null,
    dlPelezaReportPhoto: dl?.pelezaReport?.url ?? null,
    dlPelezaReportDocId: dl?.pelezaReport?.documentId ?? null,
    cogcSituation: cogcSituationFromResource(resource),
    cogcCertificatePhoto: gc?.certificate?.url ?? null,
    cogcCertificateDocId: gc?.certificate?.documentId ?? null,
    cogcPelezaReportPhoto: gc?.pelezaReport?.url ?? null,
    cogcPelezaReportDocId: gc?.pelezaReport?.documentId ?? null,
    references: referenceRows,
    refConsent: resource.references?.customerConsent ?? false,
    opModel: om?.type ?? "",
    boltActive:
      fleetActive === true ? "yes" : fleetActive === false ? "no" : "",
    stageName: om?.stage?.stageName ?? "",
    chairName: om?.stage?.chairpersonName ?? "",
    chairPhone: om?.stage?.chairpersonPhone
      ? formatKenyanPhoneDisplay(om.stage.chairpersonPhone)
      : "",
    chairCalled: om?.stage?.chairpersonCalled ?? false,
    chairOutcome: om?.stage?.callOutcome ?? "",
    worksPlatform: om?.delivery?.worksPlatform ?? "",
    platformName: om?.delivery?.platformName ?? "",
    platformContact: om?.delivery?.platformContact ?? "",
    verifyConsent:
      om?.delivery?.verifyConsent ?? om?.personal?.verifyConsent ?? false,
    isEmployed: om?.personal?.isEmployed ?? "",
    employerName: om?.personal?.employerName ?? "",
    employerContact: om?.personal?.employerContact ?? "",
    consentDocumentPhoto: consent.photo,
    consentDocumentDocId: consent.docId,
    businessRegistrationPhoto: businessReg.photo,
    businessRegistrationDocId: businessReg.docId,
    assetType:
      resource.financing?.assetCondition === "used" ? "used" : "new",
    productId: productIdFromFinancing(resource.financing),
    term: String(resource.financing?.termMonths ?? base.term),
    deposit: resource.financing?.depositKes ?? base.deposit,
    quoteMinDepositKes: resource.financing?.minDepositKes ?? null,
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
