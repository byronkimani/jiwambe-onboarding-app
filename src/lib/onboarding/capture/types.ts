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

export type CaptureFormState = {
  readiness: Partial<Record<string, boolean>>;
  customerFound: "portal" | "new" | null;
  name: string;
  phone: string;
  idNo: string;
  county: string;
  idPhotoFront: string | null;
  selfiePhoto: string | null;
  dlSituation: string;
  dlNumber: string;
  cogcSituation: string;
  references: { name: string; phone: string; relationship: string }[];
  refConsent: boolean;
  selectedLeadId: string | null;
  selectedLeadSource: string | null;
  opModel: string;
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

export function createEmptyCaptureForm(): CaptureFormState {
  return {
    readiness: {},
    customerFound: null,
    name: "",
    phone: "",
    idNo: "",
    county: "",
    idPhotoFront: null,
    selfiePhoto: null,
    dlSituation: "",
    dlNumber: "",
    cogcSituation: "",
    references: [
      { name: "", phone: "", relationship: "" },
      { name: "", phone: "", relationship: "" },
      { name: "", phone: "", relationship: "" },
    ],
    refConsent: false,
    selectedLeadId: null,
    selectedLeadSource: null,
    opModel: "",
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
