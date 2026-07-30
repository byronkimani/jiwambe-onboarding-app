/**
 * Client-side capture wizard form (UX). Persisted shape is
 * `OnboardingApplicationResource` — see docs/api-contract.md.
 */
export type StkUiState =
  | "idle"
  | "initiated"
  | "waiting"
  | "failed"
  | "fallback"
  | "fallbackChecking"
  | "confirmed";

export type ReferenceFormRow = {
  name: string;
  phone: string;
  relationship: string;
  nationalId: string;
  called: boolean;
};

export type CaptureFormState = {
  readiness: Partial<Record<string, boolean>>;
  customerFound: "portal" | "new" | null;
  name: string;
  phone: string;
  idNo: string;
  kraPin: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  county: string;
  subCounty: string;
  area: string;
  landmark: string;
  idPhotoFront: string | null;
  idPhotoFrontDocId: string | null;
  idPhotoBack: string | null;
  idPhotoBackDocId: string | null;
  kraCertificatePhoto: string | null;
  kraCertificateDocId: string | null;
  selfiePhoto: string | null;
  selfiePhotoDocId: string | null;
  dlSituation: string;
  dlNumber: string;
  needsSponsorship: string;
  preferredDrivingSchool: string;
  dlFrontPhoto: string | null;
  dlFrontDocId: string | null;
  dlBackPhoto: string | null;
  dlBackDocId: string | null;
  pdlDocumentPhoto: string | null;
  pdlDocumentDocId: string | null;
  dlPelezaReportPhoto: string | null;
  dlPelezaReportDocId: string | null;
  cogcSituation: string;
  cogcCertificatePhoto: string | null;
  cogcCertificateDocId: string | null;
  cogcPelezaReportPhoto: string | null;
  cogcPelezaReportDocId: string | null;
  references: ReferenceFormRow[];
  refConsent: boolean;
  selectedLeadId: string | null;
  selectedLeadSource: string | null;
  opModel: string;
  boltActive: string;
  stageName: string;
  chairName: string;
  chairPhone: string;
  chairCalled: boolean;
  chairOutcome: string;
  worksPlatform: string;
  platformName: string;
  platformContact: string;
  verifyConsent: boolean;
  isEmployed: string;
  employerName: string;
  employerContact: string;
  consentDocumentPhoto: string | null;
  consentDocumentDocId: string | null;
  businessRegistrationPhoto: string | null;
  businessRegistrationDocId: string | null;
  assetType: string;
  productId: string;
  term: string;
  deposit: number;
  /** From BFF catalog quote — display and validation only. */
  quoteMinDepositKes: number | null;
  quoteDailyKes: number | null;
  bikeReg: string | null;
  stkVerified: boolean;
  stkState: StkUiState;
  stkCheckoutId: string | null;
  stkRef: string | null;
  fallbackCode: string;
};

function emptyReferenceRow(): ReferenceFormRow {
  return { name: "", phone: "", relationship: "", nationalId: "", called: false };
}

export function createEmptyCaptureForm(): CaptureFormState {
  return {
    readiness: {},
    customerFound: null,
    name: "",
    phone: "",
    idNo: "",
    kraPin: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    county: "",
    subCounty: "",
    area: "",
    landmark: "",
    idPhotoFront: null,
    idPhotoFrontDocId: null,
    idPhotoBack: null,
    idPhotoBackDocId: null,
    kraCertificatePhoto: null,
    kraCertificateDocId: null,
    selfiePhoto: null,
    selfiePhotoDocId: null,
    dlSituation: "",
    dlNumber: "",
    needsSponsorship: "",
    preferredDrivingSchool: "",
    dlFrontPhoto: null,
    dlFrontDocId: null,
    dlBackPhoto: null,
    dlBackDocId: null,
    pdlDocumentPhoto: null,
    pdlDocumentDocId: null,
    dlPelezaReportPhoto: null,
    dlPelezaReportDocId: null,
    cogcSituation: "",
    cogcCertificatePhoto: null,
    cogcCertificateDocId: null,
    cogcPelezaReportPhoto: null,
    cogcPelezaReportDocId: null,
    references: [emptyReferenceRow(), emptyReferenceRow(), emptyReferenceRow()],
    refConsent: false,
    selectedLeadId: null,
    selectedLeadSource: null,
    opModel: "",
    boltActive: "",
    stageName: "",
    chairName: "",
    chairPhone: "",
    chairCalled: false,
    chairOutcome: "",
    worksPlatform: "",
    platformName: "",
    platformContact: "",
    verifyConsent: false,
    isEmployed: "",
    employerName: "",
    employerContact: "",
    consentDocumentPhoto: null,
    consentDocumentDocId: null,
    businessRegistrationPhoto: null,
    businessRegistrationDocId: null,
    assetType: "new",
    productId: "",
    term: "18",
    deposit: 10000,
    quoteMinDepositKes: null,
    quoteDailyKes: null,
    bikeReg: null,
    stkVerified: false,
    stkState: "idle",
    stkCheckoutId: null,
    stkRef: null,
    fallbackCode: "",
  };
}
