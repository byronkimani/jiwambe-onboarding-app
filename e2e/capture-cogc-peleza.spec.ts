import { expect, test } from "@playwright/test";
import { captureStage, AppRoutes } from "../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "./helpers/sign-in";
import {
  completeDlStage,
  completeIdentityStage,
  completeReadiness,
  selectPortalCustomer,
} from "./helpers/capture";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test("cogc peleza branch accepts PDF upload", async ({ page }) => {
  test.setTimeout(90_000);
  await signInAsOnboardingAgent(page);
  await page.goto(captureStage("readiness"));
  await completeReadiness(page);
  await selectPortalCustomer(page, "Grace Wanjiku");
  await completeIdentityStage(page);
  await completeDlStage(page);

  await expect(page).toHaveURL(/\/capture\/cogc/);
  await page.locator("select").first().selectOption("peleza");
  const pdf = {
    name: "peleza.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n%%EOF"),
  };
  await page.locator('input[type="file"]').first().setInputFiles(pdf);
  await page.waitForResponse(
    (res) => res.url().includes("/complete") && res.ok(),
    { timeout: 30_000 },
  );
  await expect(page.getByRole("button", { name: "Continue" })).toBeEnabled({
    timeout: 15_000,
  });
});
