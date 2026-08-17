const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(
  password: string,
  confirm: string,
): { ok: true } | { ok: false; message: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }
  if (password !== confirm) {
    return { ok: false, message: "Passwords do not match." };
  }
  return { ok: true };
}

export const PASSWORD_MIN_LENGTH = MIN_PASSWORD_LENGTH;

export function passwordLengthErrorMessage(
  password: string,
): string | null {
  if (password.length >= MIN_PASSWORD_LENGTH) return null;
  return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}
