"use strict";

/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS launcher for Playwright */

const { execSync } = require("child_process");

const port = Number(process.env.E2E_NEXT_PORT || 3100);

if (process.env.CI) {
  process.exit(0);
}

try {
  const pids = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .trim()
    .split("\n")
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch {
      /* already gone */
    }
  }
  if (pids.length > 0) {
    execSync("sleep 0.3");
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 0);
        process.kill(Number(pid), "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
} catch {
  /* nothing listening */
}
