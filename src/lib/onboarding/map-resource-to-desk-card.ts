import type {
  ApplicationLifecycleState,
  OnboardingApplicationResource,
  OnboardingApplicationSummary,
} from "@/lib/onboarding/application-resource";
import type { ApplicationState, OnboardingApplication } from "@/lib/onboarding/types";

const LIFECYCLE_TO_DESK_STATE: Record<
  ApplicationLifecycleState,
  ApplicationState
> = {
  DRAFT: "DRAFT",
  PAUSED: "PAUSED",
  OPS_REVIEW: "OPS_REVIEW",
  LMS_CREATED: "LMS_CREATED",
  AGREEMENT_SIGNED: "AGREEMENT_SIGNED",
  READY_FOR_RELEASE: "READY_FOR_RELEASE",
  ACTIVE_LOAN: "ACTIVE_LOAN",
  DISQUALIFIED: "DISQUALIFIED",
};

function maskNationalId(nid: string | undefined): string {
  if (!nid) return "";
  const digits = nid.replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(-4)}`;
}

function formatTerm(months: number | undefined): string {
  if (!months) return "";
  return `${months} months`;
}

export function lifecycleToDeskState(
  lifecycle: ApplicationLifecycleState,
): ApplicationState {
  return LIFECYCLE_TO_DESK_STATE[lifecycle];
}

export function mapResourceToDeskCard(
  resource: OnboardingApplicationResource,
): OnboardingApplication {
  const customer = resource.customer;
  const financing = resource.financing;
  const bike = resource.bikeAssignment;

  return {
    id: resource.referenceCode,
    nid: maskNationalId(customer?.nationalId),
    opModel: resource.operatingModel?.type ?? "",
    principal: financing?.financedAmountKes ?? 0,
    flag: resource.operations.flag ?? null,
    submittedAt: resource.submission.submittedAt ?? "",
    officer: resource.assignment.officerDisplayName,
    officerRole: "",
    station: resource.assignment.dealershipName,
    name: customer?.legalName ?? "New application",
    phone: customer?.phone ?? "",
    state: lifecycleToDeskState(resource.lifecycleState),
    lmsId: resource.operations.lmsId ?? null,
    product: financing?.productLabel ?? "",
    term: formatTerm(financing?.termMonths),
    deposit: financing?.depositKes ?? 0,
    daily: financing?.dailyAmountKes ?? 0,
    bike: bike?.registration
      ? {
          reg: bike.registration,
          model: bike.model ?? "",
          color: bike.color ?? "",
          sticker: bike.insuranceSticker ?? null,
          stickerExpiry: bike.stickerExpiry ?? null,
        }
      : null,
    opsNote: resource.operations.opsNote ?? null,
    since: resource.timestamps.updatedAt,
    pauseReason: resource.pause?.reason,
  };
}

export function mapSummaryToDeskCard(
  summary: OnboardingApplicationSummary,
): OnboardingApplication {
  return {
    id: summary.referenceCode,
    nid: summary.nationalIdMasked ?? "",
    opModel: summary.operatingModel ?? "",
    principal: summary.financedAmountKes ?? 0,
    flag: summary.flag ?? null,
    submittedAt: "",
    officer: summary.officerDisplayName ?? "",
    officerRole: "",
    station: summary.dealershipName ?? "",
    name: summary.customerDisplayName ?? "New application",
    phone: summary.phoneMasked ?? "",
    state: lifecycleToDeskState(summary.lifecycleState),
    lmsId: summary.lmsId ?? null,
    product: summary.productLabel ?? "",
    term: formatTerm(summary.termMonths ?? undefined),
    deposit: summary.depositKes ?? 0,
    daily: summary.dailyAmountKes ?? 0,
    bike: summary.bikeRegistration
      ? {
          reg: summary.bikeRegistration,
          model: "",
          color: "",
          sticker: null,
          stickerExpiry: null,
        }
      : null,
    opsNote: null,
    since: summary.updatedAt,
  };
}
