import { getDefaultOfficer } from "@/lib/onboarding/fixtures/seed-officer";
import type { OfficerProfileResponse } from "@/lib/onboarding/schemas/officer-profile-schemas";

export function getSeedOfficerProfile(): OfficerProfileResponse {
  const seed = getDefaultOfficer();
  return {
    id: seed.id,
    name: seed.name,
    role: seed.role,
    dealership: seed.dealership,
    dealershipId: "hub_ruiru",
    phone: seed.phone,
    email: seed.email,
    registeredPhone: seed.registeredPhone,
    nationalIdMask: seed.nationalIdMask,
    deviceLabel: seed.deviceLabel,
    lastSignIn: seed.lastSignIn,
  };
}

export function officerProfileFromBearerToken(
  authorization: string | null,
): OfficerProfileResponse | null {
  if (!authorization?.startsWith("Bearer mock_access_")) {
    return null;
  }
  const email = authorization.slice("Bearer mock_access_".length).trim();
  if (!email) return null;
  const profile = getSeedOfficerProfile();
  if (email !== profile.email) {
    return { ...profile, email, name: email.split("@")[0] ?? profile.name };
  }
  return profile;
}
