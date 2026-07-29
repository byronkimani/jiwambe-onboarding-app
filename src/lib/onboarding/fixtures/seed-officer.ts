import type { OfficerProfile } from "@/lib/onboarding/types";
import { DEMO_AGENT_EMAIL } from "@/lib/global/auth/demo-credentials";

export const DEFAULT_OFFICER: OfficerProfile = {
  id: "agent-jane-fo12",
  name: "John",
  role: "Field Officer · FO-12",
  dealership: "Ruiru Hub",
  phone: "254700100000",
  email: DEMO_AGENT_EMAIL,
  registeredPhone: "0712 004 118",
  nationalIdMask: "•••• 4471",
  deviceLabel: "Samsung Tab A9 · registered 02 Jun 2026",
  lastSignIn: "Today, 07:58 · Nairobi",
};

export function getDefaultOfficer(): OfficerProfile {
  return { ...DEFAULT_OFFICER };
}
