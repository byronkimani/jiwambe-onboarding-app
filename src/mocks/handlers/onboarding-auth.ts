import { http, HttpResponse } from "msw";
import {
  DEMO_AGENT_PASSWORD,
} from "@/lib/global/auth/demo-credentials";
import { extractPhoneDigits } from "@/lib/global/auth/normalize-phone";
import { getDefaultOfficer } from "@/lib/onboarding/fixtures/seed-officer";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

const DEMO_PHONE_DIGITS = "0700100000";

function normalizeLoginPhone(raw: string): string {
  const digits = extractPhoneDigits(raw);
  if (digits.startsWith("254") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }
  return digits;
}

export const onboardingAuthHandlers = [
  http.post(upstreamPath("/onboarding/agents/auth/login"), async ({ request }) => {
    const body = (await request.json()) as { phone?: string; password?: string };
    const phone = normalizeLoginPhone(body.phone ?? "");
    const password = body.password ?? "";

    if (phone !== DEMO_PHONE_DIGITS) {
      return HttpResponse.json({ error: "accountNotFound" }, { status: 403 });
    }
    if (password !== DEMO_AGENT_PASSWORD) {
      return HttpResponse.json({ error: "invalidCredentials" }, { status: 401 });
    }

    const officer = getDefaultOfficer();
    const accessToken = `mock_onboarding_access_${officer.id}`;
    const refreshToken = `mock_onboarding_refresh_${officer.id}`;

    return HttpResponse.json({
      accessToken,
      refreshToken,
      expiresIn: 3600,
      agent: {
        id: officer.id,
        name: officer.name,
        role: officer.role,
        dealership: officer.dealership,
      },
    });
  }),

  http.get(upstreamPath("/onboarding/agents/me"), ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth?.startsWith("Bearer mock_onboarding_access_")) {
      return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const officer = getDefaultOfficer();
    return HttpResponse.json({
      id: officer.id,
      name: officer.name,
      role: officer.role,
      dealership: officer.dealership,
      phone: officer.phone,
    });
  }),
];
