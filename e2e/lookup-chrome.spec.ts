import { test, expect } from "@playwright/test";
import { captureStage, AppRoutes } from "../src/lib/global/shared/routes";
import { completeReadiness } from "./helpers/capture";
import { signInAsOnboardingAgent } from "./helpers/sign-in";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test.describe("lookup UX", () => {
  test("inline search shows portal card with full phone and CTA", async ({
    page,
  }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(captureStage("readiness"));
    await completeReadiness(page);

    await page.getByPlaceholder("07XX XXX XXX or ID number").fill("0712 334 556");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("Grace Wanjiku")).toBeVisible();
    await expect(page.getByText("0712 334 556")).toBeVisible();
    await expect(page.getByText("Portal draft")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with this applicant →" }),
    ).toBeVisible();
  });
});

test.describe("capture chrome actions", () => {
  test("identity stage shows top pause and disqualify row", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(captureStage("readiness"));
    await completeReadiness(page);
    await page.getByPlaceholder("07XX XXX XXX or ID number").fill("0712 334 556");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByRole("button", { name: "Continue with this applicant →" }).click();
    await expect(page).toHaveURL(/\/capture\/identity/);
    await expect(
      page.getByRole("button", { name: "⏸ Pause application" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Disqualify" }).first(),
    ).toBeVisible();
  });
});
