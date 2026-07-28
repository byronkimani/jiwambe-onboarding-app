export type OtpVerifyErrorCode =
  | "INVALID_CODE"
  | "RATE_LIMITED"
  | "TOO_MANY_ATTEMPTS"
  | "SESSION_MISMATCH"
  | "UPSTREAM_ERROR";

export type OtpVerifyErrorDetails = {
  code: OtpVerifyErrorCode;
  message: string;
  attemptsRemaining?: number;
  retryAfterSeconds?: number;
};

export class OtpVerifyError extends Error {
  readonly code: OtpVerifyErrorCode;
  readonly attemptsRemaining?: number;
  readonly retryAfterSeconds?: number;

  constructor(details: OtpVerifyErrorDetails) {
    super(JSON.stringify(details));
    this.name = "OtpVerifyError";
    this.code = details.code;
    this.attemptsRemaining = details.attemptsRemaining;
    this.retryAfterSeconds = details.retryAfterSeconds;
  }

  get details(): OtpVerifyErrorDetails {
    const parsed = parseOtpVerifyErrorDetails(this.message);
    if (parsed) return parsed;
    return {
      code: this.code,
      message: this.message,
      attemptsRemaining: this.attemptsRemaining,
      retryAfterSeconds: this.retryAfterSeconds,
    };
  }

  static tryParseMessage(message: string): OtpVerifyErrorDetails | null {
    return parseOtpVerifyErrorDetails(message);
  }
}

export function parseOtpVerifyErrorDetails(
  raw: string,
): OtpVerifyErrorDetails | null {
  try {
    const parsed = JSON.parse(raw) as Partial<OtpVerifyErrorDetails>;
    if (
      typeof parsed.code !== "string" ||
      typeof parsed.message !== "string" ||
      !isOtpVerifyErrorCode(parsed.code)
    ) {
      return null;
    }
    return {
      code: parsed.code,
      message: parsed.message,
      attemptsRemaining: parsed.attemptsRemaining,
      retryAfterSeconds: parsed.retryAfterSeconds,
    };
  } catch {
    return null;
  }
}

function isOtpVerifyErrorCode(value: string): value is OtpVerifyErrorCode {
  return (
    value === "INVALID_CODE" ||
    value === "RATE_LIMITED" ||
    value === "TOO_MANY_ATTEMPTS" ||
    value === "SESSION_MISMATCH" ||
    value === "UPSTREAM_ERROR"
  );
}

/**
 * Walks Auth.js / Next.js error chains for OTP verify payloads thrown from authorize().
 * Auth.js v5 beta (e.g. 5.0.0-beta.32): failures often surface on signIn({ redirect: false })
 * as `{ error: "CredentialsSignin", ... }` while the thrown error may nest under `cause`.
 * Log the full caught value once when upgrading Auth.js to confirm the path still holds.
 */
export function extractOtpVerifyDetailsFromUnknown(
  err: unknown,
): OtpVerifyErrorDetails | null {
  const seen = new Set<unknown>();
  let current: unknown = err;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);

    if (current instanceof OtpVerifyError) {
      return current.details;
    }

    if (current instanceof Error) {
      const fromMessage = OtpVerifyError.tryParseMessage(current.message);
      if (fromMessage) return fromMessage;

      if ("cause" in current) {
        current = current.cause;
        continue;
      }
    }

    break;
  }

  return null;
}
