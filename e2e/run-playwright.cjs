"use strict";

/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS launcher for Playwright */

const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");

require("./free-e2e-port.cjs");

const extraArgs = process.argv.slice(2);
const result = spawnSync(
  "pnpm",
  ["exec", "playwright", "test", ...extraArgs],
  {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  },
);

process.exit(result.status === null ? 1 : result.status);
