import { expect, type Page } from "@playwright/test";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
} from "../../src/lib/global/auth/demo-credentials";
import { AppRoutes } from "../../src/lib/global/shared/routes";

const DESK_NAV_TIMEOUT_MS = 30_000;

export async function signInAsOnboardingAgent(page: Page): Promise<void> {
  await page.goto(AppRoutes.home);
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();

  await page.getByPlaceholder("you@example.com").fill(DEMO_AGENT_EMAIL);
  await page.getByPlaceholder("••••••••").fill(DEMO_AGENT_PASSWORD);

  const loginResponse = page.waitForResponse(
    (res) =>
      res.url().includes(AppRoutes.apiOnboardingAuthLogin) &&
      res.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  const loginRes = await loginResponse;
  expect(loginRes.ok()).toBeTruthy();

  await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
  await page.getByLabel("Verification code").fill(DEMO_OTP_CODE);

  await Promise.all([
    page.waitForURL(
      (url) => url.pathname === AppRoutes.desk,
      { timeout: DESK_NAV_TIMEOUT_MS },
    ),
    page.getByRole("button", { name: "Verify & sign in" }).click(),
  ]);
}
