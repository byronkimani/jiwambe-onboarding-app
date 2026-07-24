import { expect, test } from "@playwright/test";
import {
  AppRoutes,
  captureStage,
  deskApplication,
} from "../src/lib/global/shared/routes";

test.describe("shell routes", () => {
  test("login page loads", async ({ page }) => {
    await page.goto(AppRoutes.home);
    await expect(page.getByRole("heading", { name: /onboarding desk/i })).toBeVisible();
    await expect(page.getByText("Planned")).toBeVisible();
  });

  test("public shell pages load", async ({ page }) => {
    for (const path of [AppRoutes.accountBlocked, AppRoutes.offline]) {
      await page.goto(path);
      await expect(page.getByText("Planned")).toBeVisible();
    }
  });

  test("desk shell loads", async ({ page }) => {
    await page.goto(AppRoutes.desk);
    await expect(page.getByRole("heading", { name: /desk queue/i })).toBeVisible();
    await page.goto(AppRoutes.deskHistory);
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await page.goto(AppRoutes.deskDrafts);
    await expect(page.getByRole("heading", { name: "Drafts" })).toBeVisible();
  });

  test("application sub-routes load", async ({ page }) => {
    const id = "A-1042";
    await page.goto(deskApplication(id));
    await expect(page.getByRole("heading", { name: new RegExp(id) })).toBeVisible();
    await page.goto(`${deskApplication(id)}/summary`);
    await expect(page.getByRole("heading", { name: /application summary/i })).toBeVisible();
  });

  test("capture redirects to readiness", async ({ page }) => {
    await page.goto(AppRoutes.capture);
    await expect(page).toHaveURL(captureStage("readiness"));
    await expect(page.getByRole("heading", { name: /capture — readiness/i })).toBeVisible();
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get(AppRoutes.apiOnboardingHealth);
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
