import type {
  OnboardingApplicationResource,
  OnboardingDocument,
} from "@/lib/onboarding/application-resource";
import type { DocumentPurpose } from "@/lib/onboarding/documents/document-purposes";

export function documentFromPurpose(
  application: OnboardingApplicationResource,
  purpose: DocumentPurpose,
): OnboardingDocument | null {
  switch (purpose) {
    case "id_front":
      return application.customer?.idFront ?? null;
    case "id_back":
      return application.customer?.idBack ?? null;
    case "kra_certificate":
      return application.customer?.kraCertificate ?? null;
    case "selfie":
      return application.customer?.selfie ?? null;
    case "dl_front":
      return application.drivingLicence?.front ?? null;
    case "dl_back":
      return application.drivingLicence?.back ?? null;
    case "pdl_document":
      return application.drivingLicence?.pdlDocument ?? null;
    case "dl_peleza_report":
      return application.drivingLicence?.pelezaReport ?? null;
    case "cogc_certificate":
      return application.goodConduct?.certificate ?? null;
    case "cogc_peleza_report":
      return application.goodConduct?.pelezaReport ?? null;
    case "consent_document": {
      const om = application.operatingModel;
      return (
        om?.delivery?.consentDocument ??
        om?.personal?.consentDocument ??
        null
      );
    }
    case "business_registration": {
      const om = application.operatingModel;
      return (
        om?.delivery?.businessRegistration ??
        om?.personal?.businessRegistration ??
        null
      );
    }
    case "handover_photo":
      return application.bikeAssignment?.handoverPhoto ?? null;
    default:
      return null;
  }
}
