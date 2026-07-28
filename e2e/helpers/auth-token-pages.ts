import { expect, type Page } from "@playwright/test";
import { AppRoutes } from "../../src/lib/global/shared/routes";

export async function gotoActivatePasswordForm(
  page: Page,
  token: string,
): Promise<void> {
  const validated = page.waitForResponse(
    (res) =>
      res.url().includes(AppRoutes.apiOnboardingAuthActivate) &&
      res.request().method() === "POST" &&
      res.ok(),
  );
  await page.goto(
    `${AppRoutes.activate}?token=${encodeURIComponent(token)}`,
  );
  await validated;
  await expect(
    page.getByRole("heading", { name: /set your password/i }),
  ).toBeVisible();
}

export async function gotoResetPasswordForm(
  page: Page,
  token: string,
): Promise<void> {
  const validated = page.waitForResponse(
    (res) =>
      res.url().includes(AppRoutes.apiOnboardingAuthPasswordReset) &&
      res.request().method() === "POST" &&
      res.ok(),
  );
  await page.goto(
    `${AppRoutes.resetPassword}?token=${encodeURIComponent(token)}`,
  );
  await validated;
  await expect(
    page.getByRole("heading", { name: /set a new password/i }),
  ).toBeVisible();
}
