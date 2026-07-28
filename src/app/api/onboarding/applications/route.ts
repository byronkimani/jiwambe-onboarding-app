import { NextResponse } from "next/server";
import { getOnboardingSession } from "@/lib/global/auth/require-onboarding-session";
import { getSeedApplications } from "@/lib/onboarding/fixtures/seed-applications";

export async function GET() {
  const session = await getOnboardingSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    applications: getSeedApplications(),
  });
}
