import { defineConfig, devices } from "@playwright/test";

const e2ePort = Number(process.env.E2E_NEXT_PORT ?? 3100);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: "mobile-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        userAgent: devices["Pixel 5"].userAgent,
      },
    },
  ],
  webServer: {
    command: "node e2e/run-dev-e2e.cjs",
    url: baseURL,
    env: {
      E2E_NEXT_PORT: String(e2ePort),
    },
    reuseExistingServer: process.env.PW_REUSE_DEV_SERVER === "1",
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
