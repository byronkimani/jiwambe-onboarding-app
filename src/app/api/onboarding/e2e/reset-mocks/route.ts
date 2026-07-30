import { NextResponse } from "next/server";
import { isE2eMode } from "@/lib/global/shared/env";
import { resetApplicationsMockState } from "@/mocks/applications-mock-state";
import { resetDepositsMockState } from "@/mocks/deposits-mock-state";
import { resetDocumentsMockState } from "@/mocks/documents-mock-state";
import { resetOfficerAuthMockState } from "@/mocks/officer-auth-mock-state";

export async function POST(request: Request) {
  if (!isE2eMode() || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secret = process.env.E2E_RESET_SECRET;
  if (secret && request.headers.get("x-e2e-reset-secret") !== secret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  resetOfficerAuthMockState();
  resetApplicationsMockState();
  resetDepositsMockState();
  resetDocumentsMockState();
  return NextResponse.json({ ok: true });
}
