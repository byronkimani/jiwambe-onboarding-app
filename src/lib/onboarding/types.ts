export type ApplicationState =
  | "DRAFT"
  | "PAUSED"
  | "DISQUALIFIED"
  | "OPS_REVIEW"
  | "LMS_CREATED"
  | "AGREEMENT_SIGNED"
  | "READY_FOR_RELEASE"
  | "ACTIVE_LOAN";

export type StateTone = "act" | "wait" | "done";

export type StateAction = "agreement" | "release" | "summary" | "resume" | null;

export type OnboardingBike = {
  reg: string;
  model: string;
  color: string;
  sticker: string | null;
  stickerExpiry: string | null;
};

export type OnboardingApplication = {
  id: string;
  nid: string;
  opModel: string;
  principal: number;
  flag: string | null;
  submittedAt: string;
  officer: string;
  officerRole: string;
  station: string;
  name: string;
  phone: string;
  state: ApplicationState;
  lmsId: string | null;
  product: string;
  term: string;
  deposit: number;
  daily: number;
  bike: OnboardingBike | null;
  opsNote: string | null;
  since: string;
  releasedOn?: string;
  pauseReason?: string;
};

export type OfficerProfile = {
  id: string;
  name: string;
  role: string;
  dealership: string;
  phone: string;
  email: string;
  registeredPhone: string;
  nationalIdMask: string;
  deviceLabel: string;
  lastSignIn: string;
};

export type StateMeta = {
  label: string;
  tone: StateTone;
  action: StateAction;
};
