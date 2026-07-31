import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";
import { scrubLogFields } from "@/lib/global/observability/scrub-log-fields";

function scrubValue(value: unknown): unknown {
  return scrubLogFields(value);
}

export function getSentryDsn(client: boolean): string | undefined {
  const dsn = client
    ? process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN
    : process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  return dsn?.trim() || undefined;
}

export function isSentryEnabled(client = false): boolean {
  if (process.env.E2E === "1") return false;
  const dsn = getSentryDsn(client);
  if (!dsn) return false;
  if (process.env.NODE_ENV === "production") return true;
  return process.env.SENTRY_ENABLED === "1";
}

export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

export function getSentryRelease(): string | undefined {
  return (
    process.env.SENTRY_RELEASE ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    undefined
  );
}

function parseSampleRate(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 1) return fallback;
  return value;
}

export function getSentryTracesSampleRate(): number {
  if (process.env.NODE_ENV !== "production") {
    return parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 1);
  }
  return parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1);
}

type SharedInit = Pick<
  NodeOptions,
  | "dsn"
  | "enabled"
  | "environment"
  | "release"
  | "tracesSampleRate"
  | "sendDefaultPii"
  | "beforeSend"
  | "beforeBreadcrumb"
>;

export function buildSharedSentryInit(client: boolean): SharedInit {
  return {
    dsn: getSentryDsn(client),
    enabled: isSentryEnabled(client),
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    tracesSampleRate: getSentryTracesSampleRate(),
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        event.request.headers = scrubValue(
          event.request.headers,
        ) as Record<string, string>;
      }
      if (event.request?.data) {
        event.request.data = scrubValue(event.request.data);
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        breadcrumb.data = scrubValue(breadcrumb.data) as Record<string, unknown>;
      }
      return breadcrumb;
    },
  };
}

export function buildServerSentryInit(): NodeOptions {
  return {
    ...buildSharedSentryInit(false),
  };
}

export function buildEdgeSentryInit(): EdgeOptions {
  return {
    ...buildSharedSentryInit(false),
  };
}

export function buildClientSentryInit(): BrowserOptions {
  return {
    ...buildSharedSentryInit(true),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 1 : 0,
    ignoreErrors: [
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      "bff_session_expired",
    ],
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
  };
}
