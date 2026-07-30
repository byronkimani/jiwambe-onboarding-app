import type { OnboardingApplicationResource } from "@/lib/onboarding/application-resource";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";
import {
  findApplicationByIdOrRef,
  getApplicationsMockState,
} from "@/mocks/applications-mock-state";
import { apiOnboardingMockDocumentUpload } from "@/lib/global/shared/routes";

type PendingUpload = {
  applicationRef: string;
  purpose: DocumentPurpose;
  contentType: string;
  byteSize: number;
  uploaded: boolean;
};

const GLOBAL_KEY = "__jiwambeOnboardingDocumentsMockState" as const;

type DocumentsMockState = {
  pending: Map<string, PendingUpload>;
};

function createDocumentsMockState(): DocumentsMockState {
  return { pending: new Map() };
}

function getState(): DocumentsMockState {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DocumentsMockState;
  };
  if (!globalStore[GLOBAL_KEY]) {
    globalStore[GLOBAL_KEY] = createDocumentsMockState();
  }
  return globalStore[GLOBAL_KEY];
}

export function resetDocumentsMockState(): void {
  const globalStore = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DocumentsMockState;
  };
  globalStore[GLOBAL_KEY] = createDocumentsMockState();
}

function documentUrl(documentId: string, contentType: string): string {
  const ext = contentType === "application/pdf" ? "pdf" : "jpg";
  return `https://cdn.example.jiwambe.test/${documentId}.${ext}`;
}

function applyDocument(
  application: OnboardingApplicationResource,
  purpose: DocumentPurpose,
  documentId: string,
  contentType: string,
): OnboardingApplicationResource {
  const doc = {
    documentId,
    url: documentUrl(documentId, contentType),
    contentType,
    status: "ready" as const,
  };
  const now = new Date().toISOString();

  switch (purpose) {
    case "id_front":
      return {
        ...application,
        customer: { ...(application.customer ?? {}), idFront: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "id_back":
      return {
        ...application,
        customer: { ...(application.customer ?? {}), idBack: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "kra_certificate":
      return {
        ...application,
        customer: { ...(application.customer ?? {}), kraCertificate: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "selfie":
      return {
        ...application,
        customer: { ...(application.customer ?? {}), selfie: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "dl_front":
      return {
        ...application,
        drivingLicence: { ...(application.drivingLicence ?? {}), front: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "dl_back":
      return {
        ...application,
        drivingLicence: { ...(application.drivingLicence ?? {}), back: doc },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "pdl_document":
      return {
        ...application,
        drivingLicence: {
          ...(application.drivingLicence ?? {}),
          pdlDocument: doc,
          isProvisional: true,
        },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "dl_peleza_report":
      return {
        ...application,
        drivingLicence: {
          ...(application.drivingLicence ?? {}),
          pelezaReport: doc,
        },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "cogc_certificate":
      return {
        ...application,
        goodConduct: {
          ...(application.goodConduct ?? {}),
          certificate: doc,
        },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "cogc_peleza_report":
      return {
        ...application,
        goodConduct: {
          ...(application.goodConduct ?? {}),
          pelezaReport: doc,
        },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    case "consent_document": {
      const type = application.operatingModel?.type;
      if (type === "DELIVERY") {
        return {
          ...application,
          operatingModel: {
            ...(application.operatingModel ?? { type: "DELIVERY" }),
            delivery: {
              ...(application.operatingModel?.delivery ?? {}),
              consentDocument: doc,
            },
          },
          timestamps: { ...application.timestamps, updatedAt: now },
        };
      }
      if (type === "PERSONAL") {
        return {
          ...application,
          operatingModel: {
            ...(application.operatingModel ?? { type: "PERSONAL" }),
            personal: {
              ...(application.operatingModel?.personal ?? {}),
              consentDocument: doc,
            },
          },
          timestamps: { ...application.timestamps, updatedAt: now },
        };
      }
      return application;
    }
    case "business_registration": {
      const type = application.operatingModel?.type;
      if (type === "DELIVERY") {
        return {
          ...application,
          operatingModel: {
            ...(application.operatingModel ?? { type: "DELIVERY" }),
            delivery: {
              ...(application.operatingModel?.delivery ?? {}),
              businessRegistration: doc,
            },
          },
          timestamps: { ...application.timestamps, updatedAt: now },
        };
      }
      if (type === "PERSONAL") {
        return {
          ...application,
          operatingModel: {
            ...(application.operatingModel ?? { type: "PERSONAL" }),
            personal: {
              ...(application.operatingModel?.personal ?? {}),
              businessRegistration: doc,
            },
          },
          timestamps: { ...application.timestamps, updatedAt: now },
        };
      }
      return application;
    }
    case "handover_photo":
      return {
        ...application,
        bikeAssignment: {
          ...(application.bikeAssignment ?? {}),
          handoverPhoto: doc,
        },
        timestamps: { ...application.timestamps, updatedAt: now },
      };
    default:
      return application;
  }
}

export type MockDocumentInitResult =
  | {
      ok: true;
      documentId: string;
      uploadUrl: string;
      uploadHeaders: Record<string, string>;
      expiresAt: string;
    }
  | { ok: false; status: number; error: string };

export function mockInitDocument(
  applicationId: string,
  body: { purpose: DocumentPurpose; contentType: string; byteSize: number },
): MockDocumentInitResult {
  const application = findApplicationByIdOrRef(applicationId);
  if (!application) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const documentId = `doc_${crypto.randomUUID().replace(/-/g, "")}`;
  const state = getState();
  state.pending.set(documentId, {
    applicationRef: application.referenceCode,
    purpose: body.purpose,
    contentType: body.contentType,
    byteSize: body.byteSize,
    uploaded: false,
  });

  const uploadUrl = apiOnboardingMockDocumentUpload(documentId);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  return {
    ok: true,
    documentId,
    uploadUrl,
    uploadHeaders: { "Content-Type": body.contentType },
    expiresAt,
  };
}

export function mockPutDocument(documentId: string): boolean {
  const pending = getState().pending.get(documentId);
  if (!pending) return false;
  pending.uploaded = true;
  return true;
}

export type MockDocumentCompleteResult =
  | { ok: true; application: OnboardingApplicationResource }
  | { ok: false; status: number; error: string };

export function mockCompleteDocument(
  applicationId: string,
  documentId: string,
): MockDocumentCompleteResult {
  const pending = getState().pending.get(documentId);
  if (!pending) {
    return { ok: false, status: 404, error: "not_found" };
  }
  if (!pending.uploaded) {
    return { ok: false, status: 400, error: "upload_incomplete" };
  }

  const application = findApplicationByIdOrRef(applicationId);
  if (!application || application.referenceCode !== pending.applicationRef) {
    return { ok: false, status: 404, error: "not_found" };
  }

  const updated = applyDocument(
    application,
    pending.purpose,
    documentId,
    pending.contentType,
  );
  updated.version += 1;

  getApplicationsMockState().byReferenceCode.set(
    updated.referenceCode,
    updated,
  );
  getState().pending.delete(documentId);

  return { ok: true, application: updated };
}
