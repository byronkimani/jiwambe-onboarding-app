export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/** User-facing copy for login / forgot-password email fields. */
export function emailFormatErrorMessage(email: string): string | null {
  if (!email.trim()) {
    return "Enter your email address.";
  }
  if (!isValidEmailFormat(email)) {
    return "Enter a valid email address (for example you@company.com).";
  }
  return null;
}
