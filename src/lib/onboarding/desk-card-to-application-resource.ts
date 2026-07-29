import type {
  ApplicationLifecycleState,
  OnboardingApplicationResource,
  OperatingModelType,
} from "@/lib/onboarding/application-resource";
import type { OnboardingApplication } from "@/lib/onboarding/types";
import { DEFAULT_OFFICER } from "@/lib/onboarding/fixtures/seed-officer";

function deskStateToLifecycle(
  state: OnboardingApplication["state"],
): ApplicationLifecycleState {
  return state as ApplicationLifecycleState;
}

function operatingModelFromCard(
  opModel: string,
): OnboardingApplicationResource["operatingModel"] {
  if (!opModel) return null;
  const type = opModel as OperatingModelType;
  const base = { type, stage: null, delivery: null, personal: null };
  switch (type) {
    case "FLEET":
      return { ...base, fleet: { boltDriverActive: true } };
    case "STAGE":
      return { ...base, stage: {} };
    case "DELIVERY":
      return { ...base, delivery: {} };
    case "PERSONAL":
      return { ...base, personal: {} };
    default:
      return { ...base, fleet: { boltDriverActive: true } };
  }
}

function placeholderDoc(documentId: string, label: string) {
  return {
    documentId,
    url: `https://cdn.example.jiwambe.test/mock/${documentId}/${label}`,
    status: "ready" as const,
  };
}

/** Builds a contract-shaped resource from a desk fixture card (demo / MSW). */
export function deskCardToApplicationResource(
  card: OnboardingApplication,
): OnboardingApplicationResource {
  const lifecycle = deskStateToLifecycle(card.state);
  const termMonths = Number.parseInt(card.term, 10) || undefined;

  return {
    id: `app_${card.id.replace(/-/g, "_").toLowerCase()}`,
    referenceCode: card.id,
    version: 1,
    lifecycleState: lifecycle,
    pause:
      card.state === "PAUSED" && card.pauseReason
        ? {
            reason: card.pauseReason,
            pausedAt: card.since,
            pausedByOfficerId: "off_demo",
          }
        : null,
    leadId: null,
    leadSource: null,
    assignment: {
      officerId: DEFAULT_OFFICER.id,
      officerDisplayName: card.officer,
      dealershipId: "hub_ruiru",
      dealershipName: card.station,
    },
    readinessAttestations: null,
    customer: {
      legalName: card.name,
      phone: card.phone,
      nationalId: card.nid.replace(/\s/g, ""),
      idFront: placeholderDoc(`doc_${card.id}_id_front`, "id-front.jpg"),
      idBack: placeholderDoc(`doc_${card.id}_id_back`, "id-back.jpg"),
      selfie: placeholderDoc(`doc_${card.id}_selfie`, "selfie.jpg"),
      faceMatchScore: 0.92,
      faceMatchPassed: true,
      idOcrStatus: "completed",
    },
    drivingLicence: {
      licenceNumber: "DL-DEMO",
      licenceClass: "BCE",
      expiryDate: "2028-06-01",
      isProvisional: false,
      front: placeholderDoc(`doc_${card.id}_dl_front`, "dl-front.jpg"),
      back: placeholderDoc(`doc_${card.id}_dl_back`, "dl-back.jpg"),
      pelezaReport: null,
    },
    goodConduct: {
      certificate: placeholderDoc(`doc_${card.id}_cogc`, "cogc.pdf"),
      pelezaReport: null,
    },
    references: {
      customerConsent: true,
      entries: [],
      nextOfKin: null,
    },
    operatingModel: operatingModelFromCard(card.opModel),
    financing: {
      productLabel: card.product,
      termMonths,
      depositKes: card.deposit,
      dailyAmountKes: card.daily,
      financedAmountKes: card.principal,
      depositPayment:
        card.deposit > 0
          ? { method: "stk", status: "verified", verifiedAt: card.submittedAt }
          : null,
    },
    bikeAssignment: card.bike
      ? {
          registration: card.bike.reg,
          model: card.bike.model,
          color: card.bike.color,
          insuranceSticker: card.bike.sticker,
          stickerExpiry: card.bike.stickerExpiry,
        }
      : null,
    submission: {
      submittedAt: card.submittedAt || null,
      officerAttestation: lifecycle !== "DRAFT" && lifecycle !== "PAUSED",
    },
    operations: {
      lmsId: card.lmsId,
      opsNote: card.opsNote,
      flag: card.flag,
    },
    timestamps: {
      createdAt: card.submittedAt || card.since,
      updatedAt: card.since,
    },
  };
}
