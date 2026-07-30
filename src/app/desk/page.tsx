import { DeskWorklistScreen } from "@/components/onboarding/desk/desk-worklist-screen";
import { getOnboardingSession } from "@/lib/global/auth/require-onboarding-session";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";
import { getSeedApplications } from "@/lib/onboarding/fixtures/seed-applications";

export default async function DeskPage() {
  const session = await getOnboardingSession();
  const initialApplications = session ? getSeedApplications() : undefined;

  return (
    <DeskWorklistScreen
      mode="queue"
      initialApplications={initialApplications}
      demoLifecycleControls={isMockJiwambeApiEnabled()}
    />
  );
}
