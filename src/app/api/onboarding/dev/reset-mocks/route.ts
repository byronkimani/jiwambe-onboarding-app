import { NextResponse } from "next/server";
import { isMockJiwambeApiEnabled } from "@/lib/global/shared/env";
import { resetAllOnboardingMockState } from "@/mocks/reset-all-mock-state";

export async function POST() {
  if (
    process.env.NODE_ENV === "production" ||
    !isMockJiwambeApiEnabled()
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  resetAllOnboardingMockState();
  return NextResponse.json({ ok: true });
}
