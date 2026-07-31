import {
  getSentryEnvironment,
  getSentryRelease,
} from "@/lib/global/observability/sentry-options";
import { scrubLogFields } from "@/lib/global/observability/scrub-log-fields";

export type LogLevel = "info" | "warn" | "error";

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

export function isStructuredLoggingEnabled(): boolean {
  if (process.env.E2E === "1") return false;
  if (process.env.NODE_ENV === "production") return true;
  return process.env.STRUCTURED_LOGGING_ENABLED === "1";
}

export function getLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw === "warn" || raw === "error") return raw;
  return "info";
}

function shouldLog(level: LogLevel): boolean {
  if (!isStructuredLoggingEnabled()) return false;
  return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[getLogLevel()];
}

export type StructuredLogFields = Record<string, unknown>;

function writeLog(level: LogLevel, message: string, fields?: StructuredLogFields) {
  if (!shouldLog(level)) return;

  const payload = scrubLogFields({
    level,
    msg: message,
    service: "jiwambe-onboarding-app",
    env: getSentryEnvironment(),
    release: getSentryRelease(),
    timestamp: new Date().toISOString(),
    ...fields,
  }) as Record<string, unknown>;

  console.log(JSON.stringify(payload));
}

export function logInfo(message: string, fields?: StructuredLogFields): void {
  writeLog("info", message, fields);
}

export function logWarn(message: string, fields?: StructuredLogFields): void {
  writeLog("warn", message, fields);
}

export function logError(message: string, fields?: StructuredLogFields): void {
  writeLog("error", message, fields);
}

/** Test helper — reset is a no-op; tests use vi.stubEnv */
export function resetStructuredLoggingForTests(): void {
  // Intentionally empty — env is stubbed per test via vitest.
}
