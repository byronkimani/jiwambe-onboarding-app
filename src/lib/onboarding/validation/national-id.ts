export const NATIONAL_ID_VALIDATION_MESSAGE =
  "Enter a valid National ID number (5–9 digits).";

const NATIONAL_ID_DIGITS_REGEX = /^\d{5,9}$/;

export function normalizeNationalIdDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isValidNationalId(raw: string): boolean {
  const digits = normalizeNationalIdDigits(raw);
  return NATIONAL_ID_DIGITS_REGEX.test(digits);
}

export function nationalIdFormatErrorMessage(raw: string): string | null {
  if (!raw.trim()) {
    return "National ID is required.";
  }
  if (!isValidNationalId(raw)) {
    return NATIONAL_ID_VALIDATION_MESSAGE;
  }
  return null;
}
