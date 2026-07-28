import { onboardingApplicationsHandlers } from "@/mocks/handlers/onboarding-applications";
import { onboardingAuthHandlers } from "@/mocks/handlers/onboarding-auth";

export const handlers = [
  ...onboardingAuthHandlers,
  ...onboardingApplicationsHandlers,
] as const;
