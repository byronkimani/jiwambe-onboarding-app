import * as Sentry from "@sentry/nextjs";
import { replayIntegration } from "@sentry/nextjs";
import { buildClientSentryInit } from "@/lib/global/observability/sentry-options";

Sentry.init({
  ...buildClientSentryInit(),
  integrations: [
    replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
