/**
 * Officer onboarding application — upstream / BFF resource shape.
 * @see docs/api-contract.md
 */

export type ApplicationLifecycleState =
  | "DRAFT"
  | "PAUSED"
  | "OPS_REVIEW"
  | "LMS_CREATED"
  | "AGREEMENT_SIGNED"
  | "READY_FOR_RELEASE"
  | "ACTIVE_LOAN"
  | "DISQUALIFIED";

export type OnboardingDocumentStatus =
  | "uploading"
  | "ready"
  | "failed"
  | "rejected";

export type OnboardingDocument = {
  documentId: string;
  url: string;
  contentType?: string;
  fileName?: string;
  byteSize?: number;
  uploadedAt?: string;
  status?: OnboardingDocumentStatus;
};

export type ReadinessAttestations = {
  hasId: boolean;
  knowsKra: boolean;
  dlKnown: boolean;
  cogcKnown: boolean;
  hasFunds: boolean;
  refsBriefed: boolean;
  attestedAt?: string;
};

export type ApplicationAssignment = {
  officerId: string;
  officerDisplayName: string;
  dealershipId: string;
  dealershipName: string;
};

export type ApplicationPause = {
  reason: string;
  pausedAt: string;
  pausedByOfficerId: string;
};

export type CustomerAddress = {
  county: string;
  subCounty?: string;
  area?: string;
  landmark?: string;
};

export type ApplicationCustomer = {
  legalName?: string;
  phone?: string;
  nationalId?: string;
  kraPin?: string;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  address?: CustomerAddress;
  idFront?: OnboardingDocument | null;
  idBack?: OnboardingDocument | null;
  kraCertificate?: OnboardingDocument | null;
  selfie?: OnboardingDocument | null;
  faceMatchScore?: number | null;
  faceMatchPassed?: boolean | null;
  idOcrStatus?: string | null;
};

export type ApplicationDrivingLicence = {
  licenceNumber?: string;
  licenceClass?: string;
  expiryDate?: string;
  isProvisional?: boolean;
  front?: OnboardingDocument | null;
  back?: OnboardingDocument | null;
  pelezaReport?: OnboardingDocument | null;
};

export type ApplicationGoodConduct = {
  certificate?: OnboardingDocument | null;
  pelezaReport?: OnboardingDocument | null;
  issuedOn?: string;
  expiresOn?: string;
};

export type ReferenceEntry = {
  name: string;
  nationalId?: string;
  phone: string;
  relationship: string;
  called?: boolean;
  callOutcome?: string;
};

export type ApplicationReferences = {
  customerConsent: boolean;
  entries: ReferenceEntry[];
  nextOfKin?: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
};

export type OperatingModelType = "FLEET" | "STAGE" | "DELIVERY" | "PERSONAL";

export type ApplicationOperatingModel = {
  type: OperatingModelType;
  fleet?: { boltDriverActive: boolean } | null;
  stage?: Record<string, unknown> | null;
  delivery?: Record<string, unknown> | null;
  personal?: Record<string, unknown> | null;
};

export type DepositPayment = {
  method: "stk" | "mpesa_code";
  status: "pending" | "verified" | "failed";
  verifiedAt?: string | null;
  mpesaReceipt?: string | null;
};

export type ApplicationFinancing = {
  productId?: string;
  productLabel?: string;
  assetCondition?: "new" | "used";
  termMonths?: number;
  depositKes?: number;
  dailyAmountKes?: number;
  minDepositKes?: number;
  financedAmountKes?: number;
  quoteUpdatedAt?: string;
  depositPayment?: DepositPayment | null;
};

export type ApplicationBikeAssignment = {
  inventoryItemId?: string;
  registration?: string;
  model?: string;
  color?: string;
  insuranceSticker?: string | null;
  stickerExpiry?: string | null;
  holdAvailableUntil?: string | null;
};

export type ApplicationSubmission = {
  submittedAt?: string | null;
  officerAttestation?: boolean;
};

export type ApplicationOperations = {
  lmsId?: string | null;
  opsNote?: string | null;
  flag?: string | null;
};

export type ApplicationTimestamps = {
  createdAt: string;
  updatedAt: string;
};

export type OnboardingApplicationResource = {
  id: string;
  referenceCode: string;
  version: number;
  lifecycleState: ApplicationLifecycleState;
  pause: ApplicationPause | null;
  leadId?: string | null;
  leadSource?: string | null;
  assignment: ApplicationAssignment;
  readinessAttestations?: ReadinessAttestations | null;
  customer?: ApplicationCustomer | null;
  drivingLicence?: ApplicationDrivingLicence | null;
  goodConduct?: ApplicationGoodConduct | null;
  references?: ApplicationReferences | null;
  operatingModel?: ApplicationOperatingModel | null;
  financing?: ApplicationFinancing | null;
  bikeAssignment?: ApplicationBikeAssignment | null;
  submission: ApplicationSubmission;
  operations: ApplicationOperations;
  timestamps: ApplicationTimestamps;
};

export type OnboardingApplicationSummary = {
  id: string;
  referenceCode: string;
  lifecycleState: ApplicationLifecycleState;
  customerDisplayName?: string | null;
  phoneMasked?: string | null;
  operatingModel?: string | null;
  productLabel?: string | null;
  depositKes?: number | null;
  dailyAmountKes?: number | null;
  bikeRegistration?: string | null;
  flag?: string | null;
  updatedAt: string;
  officerDisplayName?: string | null;
  dealershipName?: string | null;
  termMonths?: number | null;
  lmsId?: string | null;
  financedAmountKes?: number | null;
  nationalIdMasked?: string | null;
};

export type CustomerLookupMatch = {
  leadId: string;
  source: string;
  displayName: string;
  phoneMasked: string;
  nationalIdMasked?: string | null;
};

export type CustomerLookupResponse = {
  matches: CustomerLookupMatch[];
};
