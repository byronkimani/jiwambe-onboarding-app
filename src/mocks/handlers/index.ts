import { onboardingApplicationsHandlers } from "@/mocks/handlers/onboarding-applications";
import { onboardingDocumentsHandlers } from "@/mocks/handlers/onboarding-documents";
import { ecosystemCatalogHandlers } from "@/mocks/handlers/ecosystem-catalog";
import { ecosystemCustomersHandlers } from "@/mocks/handlers/ecosystem-customers";
import { ecosystemInventoryHandlers } from "@/mocks/handlers/ecosystem-inventory";
import { ecosystemPaymentsHandlers } from "@/mocks/handlers/ecosystem-payments";
import { onboardingOfficerAuthHandlers } from "@/mocks/handlers/onboarding-officer-auth";

export const handlers = [
  ...onboardingOfficerAuthHandlers,
  ...onboardingApplicationsHandlers,
  ...onboardingDocumentsHandlers,
  ...ecosystemCatalogHandlers,
  ...ecosystemCustomersHandlers,
  ...ecosystemInventoryHandlers,
  ...ecosystemPaymentsHandlers,
] as const;
