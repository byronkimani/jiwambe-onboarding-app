import { onboardingNotImplemented } from "@/lib/global/onboarding/onboarding-not-implemented";

export async function GET() {
  return onboardingNotImplemented();
}
