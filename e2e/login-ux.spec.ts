import { test, expect } from "@playwright/test";
import { AppRoutes } from "../src/lib/global/shared/routes";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test.describe("login UX", () => {
  test("Continue stays disabled until email and password are valid", async ({
    page,
  }) => {
    await page.goto(AppRoutes.home);
    const continueBtn = page.getByRole("button", { name: "Continue" });
    await expect(continueBtn).toBeDisabled();

    await page.getByLabel("Email").fill("agent@example.com");
    await expect(continueBtn).toBeDisabled();

    await page.getByLabel("Password").fill("short");
    await page.getByLabel("Password").blur();
    await expect(
      page.getByText("Password must be at least 8 characters."),
    ).toBeVisible();
    await expect(continueBtn).toBeDisabled();

    await page.getByLabel("Password").fill("validpass");
    await expect(continueBtn).toBeEnabled();
  });

  test("email shows inline error on blur when invalid", async ({ page }) => {
    await page.goto(AppRoutes.home);
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Email").blur();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});
