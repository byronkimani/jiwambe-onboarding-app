import { z } from "zod";

export const officerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  dealership: z.string().min(1),
  dealershipId: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().email(),
  registeredPhone: z.string().min(1),
  nationalIdMask: z.string().min(1),
  deviceLabel: z.string().min(1),
  lastSignIn: z.string().min(1),
});

export type OfficerProfileResponse = z.infer<typeof officerProfileSchema>;

export function parseOfficerProfileResponse(
  json: unknown,
): { ok: true; profile: OfficerProfileResponse } | { ok: false } {
  const parsed = officerProfileSchema.safeParse(json);
  if (!parsed.success) return { ok: false };
  return { ok: true, profile: parsed.data };
}
