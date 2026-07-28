import { expect, type Page } from "@playwright/test";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
} from "../../src/lib/global/auth/demo-credentials";
import { AppRoutes } from "../../src/lib/global/shared/routes";

export async function signInAsOnboardingAgent(page: Page): Promise<void> {
  await page.goto(AppRoutes.home);
  await page.getByPlaceholder("you@example.com").fill(DEMO_AGENT_EMAIL);
  await page.getByPlaceholder("••••••••").fill(DEMO_AGENT_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
  await page.getByPlaceholder("······").fill(DEMO_OTP_CODE);
  await page.getByRole("button", { name: "Verify & sign in" }).click();
  await expect(page).toHaveURL(AppRoutes.desk);
}
