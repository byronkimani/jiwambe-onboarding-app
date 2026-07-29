import { NextResponse } from "next/server";
import { isE2eMode } from "@/lib/global/shared/env";
import { resetOfficerAuthMockState } from "@/mocks/officer-auth-mock-state";

export async function POST() {
  if (!isE2eMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  resetOfficerAuthMockState();
  return NextResponse.json({ ok: true });
}
