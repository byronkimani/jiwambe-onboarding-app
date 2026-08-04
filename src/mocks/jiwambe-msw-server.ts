import type { Server } from "node:http";
import { createServer } from "@mswjs/http-middleware";
import {
  DEFAULT_MOCK_JIWAMBE_API_BASE_URL,
  getJiwambeApiBaseUrl,
} from "@/lib/global/shared/env";
import { handlers } from "@/mocks/handlers";

type MockHttpGlobals = typeof globalThis & {
  __jiwambeOnboardingMockHttpServer?: Server;
  __jiwambeOnboardingMockHttpReady?: Promise<void>;
};

function resolveMockUpstreamSocket(): { host: string; port: number } {
  const base =
    process.env.JIWAMBE_API_BASE_URL ?? DEFAULT_MOCK_JIWAMBE_API_BASE_URL;
  const url = new URL(base);
  return {
    host: url.hostname || "127.0.0.1",
    port: url.port ? Number(url.port) : 18080,
  };
}

function startMockHttpServer(): Promise<void> {
  const globalStore = globalThis as MockHttpGlobals;
  if (globalStore.__jiwambeOnboardingMockHttpReady) {
    return globalStore.__jiwambeOnboardingMockHttpReady;
  }

  const { host, port } = resolveMockUpstreamSocket();
  const app = createServer(...handlers);

  globalStore.__jiwambeOnboardingMockHttpReady = new Promise((resolve, reject) => {
    const onError = (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        // Another dev worker or prior instance already owns the mock port.
        resolve();
        return;
      }
      reject(error);
    };

    const httpServer = app.listen(port, host, () => {
      httpServer.off("error", onError);
      globalStore.__jiwambeOnboardingMockHttpServer = httpServer;
      if (process.env.NODE_ENV === "development") {
        console.info(
          `[jiwambe-msw] Mock upstream listening on http://${host}:${port}/v1`,
        );
      }
      resolve();
    });

    httpServer.once("error", onError);
  });

  return globalStore.__jiwambeOnboardingMockHttpReady;
}

/**
 * When MOCK_JIWAMBE_API=1, start a real HTTP server on JIWAMBE_API_BASE_URL's host/port.
 * BFF `fetch()` calls that URL directly — no global fetch patching (Turbopack-safe).
 */
export async function ensureJiwambeMsw(): Promise<void> {
  if (process.env.MOCK_JIWAMBE_API !== "1") {
    return;
  }

  // Validate env early so misconfiguration fails at startup, not on first fetch.
  getJiwambeApiBaseUrl();
  await startMockHttpServer();
}

/** @internal Test-only reset for mock HTTP server lifecycle. */
export function resetJiwambeMockHttpServerForTests(): void {
  const globalStore = globalThis as MockHttpGlobals;
  const server = globalStore.__jiwambeOnboardingMockHttpServer;
  if (server) {
    server.close();
  }
  delete globalStore.__jiwambeOnboardingMockHttpServer;
  delete globalStore.__jiwambeOnboardingMockHttpReady;
}
