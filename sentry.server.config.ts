import * as Sentry from "@sentry/nextjs";
import { buildServerSentryInit } from "@/lib/global/observability/sentry-options";

Sentry.init(buildServerSentryInit());
