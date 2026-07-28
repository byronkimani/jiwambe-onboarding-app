import { getDefaultOfficer } from "@/lib/onboarding/fixtures/seed-officer";

/** MSW / prototype demo session — no outbound login fetch (matches prototype OTP verify). */
export function buildDemoOfficerAuthUser(email: string) {
  const officer = getDefaultOfficer();
  return {
    id: officer.id,
    name: officer.name,
    email: email.trim().toLowerCase(),
    agentId: officer.id,
    agentRole: officer.role,
    dealership: officer.dealership,
    backendAccessToken: `mock_onboarding_access_${officer.id}`,
    backendRefreshToken: `mock_onboarding_refresh_${officer.id}`,
    accessTokenExpires: Date.now() + 3600 * 1000,
  };
}
