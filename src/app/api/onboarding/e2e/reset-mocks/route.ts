import { NextResponse } from "next/server";
import { isE2eMode } from "@/lib/global/shared/env";
import { resetApplicationsMockState } from "@/mocks/applications-mock-state";
import { resetDepositsMockState } from "@/mocks/deposits-mock-state";
import { resetOfficerAuthMockState } from "@/mocks/officer-auth-mock-state";

export async function POST() {
  if (!isE2eMode()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  resetOfficerAuthMockState();
  resetApplicationsMockState();
  resetDepositsMockState();
  return NextResponse.json({ ok: true });
}
