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
  opModel: string;
  assetType: string;
  productId: string;
  term: string;
  deposit: number;
  bikeReg: string | null;
  stkVerified: boolean;
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
    opModel: "",
    assetType: "new",
    productId: "",
    term: "18",
    deposit: 10000,
    bikeReg: null,
    stkVerified: false,
  };
}
