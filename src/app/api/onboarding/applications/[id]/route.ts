import { NextResponse } from "next/server";
import { getOnboardingSession } from "@/lib/global/auth/require-onboarding-session";
import { getSeedApplicationById } from "@/lib/onboarding/fixtures/seed-applications";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getOnboardingSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = getSeedApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ application });
}
