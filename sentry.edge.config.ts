import * as Sentry from "@sentry/nextjs";
import { buildEdgeSentryInit } from "@/lib/global/observability/sentry-options";

Sentry.init(buildEdgeSentryInit());
