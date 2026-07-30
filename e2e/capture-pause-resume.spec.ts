import { expect, test } from "@playwright/test";
import { AppRoutes, captureStage } from "../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "./helpers/sign-in";
import { completeReadiness } from "./helpers/capture";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test("pause mid-capture saves to drafts", async ({ page }) => {
  test.setTimeout(90_000);
  await signInAsOnboardingAgent(page);
  await page.goto(captureStage("readiness"));
  await completeReadiness(page);
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByPlaceholder("Reason (required)").fill("E2E pause mid-capture");
  await page.getByRole("button", { name: "Pause" }).last().click();
  await expect(page).toHaveURL(AppRoutes.deskDrafts, { timeout: 20_000 });
});
