"use strict";

/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS launcher for Playwright */

const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const NEXT_PORT = Number(process.env.E2E_NEXT_PORT || 3100);
const NEXT_HOST = "127.0.0.1";

const next = spawn(
  "pnpm",
  ["exec", "next", "dev", "-H", NEXT_HOST, "-p", String(NEXT_PORT)],
  {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "development",
      E2E: "1",
      MOCK_JIWAMBE_API: "1",
      NEXTAUTH_SECRET: "e2e-placeholder-secret-min-32-chars-long",
      NEXTAUTH_URL: `http://${NEXT_HOST}:${NEXT_PORT}`,
      JIWAMBE_API_BASE_URL: "http://127.0.0.1:18080/api/v1",
      WATCHPACK_POLLING: "true",
    },
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

const shutdown = () => {
  next.kill("SIGTERM");
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

next.on("exit", (code) => {
  process.exit(code ?? 0);
});
