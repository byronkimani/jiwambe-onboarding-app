import { z } from "zod";
import { KENYA_PHONE_VALIDATION_MESSAGE } from "@/lib/global/auth/phone-field-constants";

export const FLEET_PHONE_NATIONAL_MAX_DIGITS = 10;

const KENYA_NATIONAL_FIELD_REGEX = /^0?[17]\d{8}$/;
const KENYA_MSISDN_WIRE_REGEX = /^254[17]\d{8}$/;

export function extractPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function sanitizeNationalPhoneInput(raw: string): string {
  return extractPhoneDigits(raw).slice(0, FLEET_PHONE_NATIONAL_MAX_DIGITS);
}

export function isValidKenyaNationalPhone(digits: string): boolean {
  return KENYA_NATIONAL_FIELD_REGEX.test(digits);
}

export function normalizeKenyaMsisdn(raw: string): string {
  const digits = extractPhoneDigits(raw);

  let wire: string;
  if (digits.startsWith("254")) {
    wire = digits;
  } else if (digits.startsWith("0")) {
    const rest = digits.length >= 10 ? digits.slice(1) : digits;
    wire = `254${rest}`;
  } else if (/^[17]\d{8}$/.test(digits)) {
    wire = `254${digits}`;
  } else {
    wire = digits;
  }

  if (!KENYA_MSISDN_WIRE_REGEX.test(wire)) {
    throw new Error(KENYA_PHONE_VALIDATION_MESSAGE);
  }

  return wire;
}

export type ParseKenyaPhoneResult =
  | { ok: true; wire: string }
  | { ok: false };

export function parseKenyaPhoneForSubmit(raw: string): ParseKenyaPhoneResult {
  const digits = extractPhoneDigits(raw);
  if (!digits || !isValidKenyaNationalPhone(digits)) {
    return { ok: false };
  }

  try {
    const wire = normalizeKenyaMsisdn(digits);
    if (!kenyaMsisdnWireSchema.safeParse(wire).success) {
      return { ok: false };
    }
    return { ok: true, wire };
  } catch {
    return { ok: false };
  }
}

export const kenyaMsisdnWireSchema = z
  .string()
  .regex(KENYA_MSISDN_WIRE_REGEX, KENYA_PHONE_VALIDATION_MESSAGE);

export function formatKenyanPhoneDisplay(wireOrE164: string): string {
  const digits = extractPhoneDigits(wireOrE164);
  const national =
    digits.startsWith("254") && digits.length === 12
      ? `0${digits.slice(3)}`
      : digits;

  if (national.length === 10 && national.startsWith("0")) {
    return `${national.slice(0, 4)} ${national.slice(4, 7)} ${national.slice(7)}`;
  }

  return wireOrE164;
}
