import { NextResponse } from "next/server";
import { requireOnboardingUpstream } from "@/lib/global/onboarding/onboarding-bff";

export async function onboardingNotImplemented(): Promise<NextResponse> {
  const session = await requireOnboardingUpstream();
  if (!session.ok) {
    return session.response;
  }
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
