import { DeskWorklistScreen } from "@/components/onboarding/desk/desk-worklist-screen";
import { getOnboardingSession } from "@/lib/global/auth/require-onboarding-session";
import { getSeedApplications } from "@/lib/onboarding/fixtures/seed-applications";

export default async function DeskHistoryPage() {
  const session = await getOnboardingSession();
  const initialApplications = session ? getSeedApplications() : undefined;

  return (
    <DeskWorklistScreen
      mode="history"
      initialApplications={initialApplications}
    />
  );
}
