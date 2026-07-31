import "../sentry.server.config";
import { ensureJiwambeMsw } from "@/mocks/jiwambe-msw-server";

if (process.env.MOCK_JIWAMBE_API === "1") {
  ensureJiwambeMsw();
}
