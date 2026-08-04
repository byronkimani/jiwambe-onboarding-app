import "../sentry.server.config";
import { ensureJiwambeMsw } from "@/mocks/jiwambe-msw-server";

if (process.env.MOCK_JIWAMBE_API === "1") {
  void ensureJiwambeMsw().catch((error: unknown) => {
    console.error("[jiwambe-msw] Failed to start mock upstream HTTP server", error);
  });
}
