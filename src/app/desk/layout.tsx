import { auth } from "@/auth";
import { OnboardingChromeProvider } from "@/components/onboarding/onboarding-chrome-context";
import { getDefaultOfficer } from "@/lib/onboarding/fixtures/seed-officer";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const officer = getDefaultOfficer();
  if (session?.user?.name) {
    officer.name = session.user.name;
  }
  if (session?.user?.email) {
    officer.email = session.user.email;
  }

  return (
    <OnboardingChromeProvider officer={officer}>
      <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
    </OnboardingChromeProvider>
  );
}
