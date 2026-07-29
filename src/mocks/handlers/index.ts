import { onboardingApplicationsHandlers } from "@/mocks/handlers/onboarding-applications";
import { onboardingCatalogHandlers } from "@/mocks/handlers/onboarding-catalog";
import { onboardingDepositsHandlers } from "@/mocks/handlers/onboarding-deposits";
import { onboardingInventoryHandlers } from "@/mocks/handlers/onboarding-inventory";
import { onboardingOfficerAuthHandlers } from "@/mocks/handlers/onboarding-officer-auth";

export const handlers = [
  ...onboardingOfficerAuthHandlers,
  ...onboardingApplicationsHandlers,
  ...onboardingCatalogHandlers,
  ...onboardingDepositsHandlers,
  ...onboardingInventoryHandlers,
] as const;
