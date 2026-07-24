import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

type MswServer = ReturnType<typeof setupServer>;

const globalForMsw = globalThis as typeof globalThis & {
  __jiwambeOnboardingMswServer?: MswServer;
};

export function ensureJiwambeMsw(): void {
  if (process.env.MOCK_JIWAMBE_API !== "1") {
    return;
  }

  if (globalForMsw.__jiwambeOnboardingMswServer) {
    return;
  }

  const server = setupServer(...handlers);
  server.listen({
    onUnhandledRequest:
      process.env.NODE_ENV === "development" ||
      process.env.MOCK_JIWAMBE_API === "1"
        ? "warn"
        : "bypass",
  });
  globalForMsw.__jiwambeOnboardingMswServer = server;
}
