import { onboardingApplicationsHandlers } from "@/mocks/handlers/onboarding-applications";
import { onboardingOfficerAuthHandlers } from "@/mocks/handlers/onboarding-officer-auth";

export const handlers = [
  ...onboardingOfficerAuthHandlers,
  ...onboardingApplicationsHandlers,
] as const;
