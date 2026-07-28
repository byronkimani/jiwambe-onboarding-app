import { expect, test } from "@playwright/test";
import {
  AppRoutes,
  captureStage,
  deskApplicationAgreement,
} from "../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "./helpers/sign-in";

test.describe("shell routes", () => {
  test("login page loads", async ({ page }) => {
    await page.goto(AppRoutes.home);
    await expect(
      page.getByText("Jiwambe Onboarding", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Officer sign-in")).toBeVisible();
  });

  test("public shell pages load", async ({ page }) => {
    for (const path of [AppRoutes.accountBlocked, AppRoutes.offline]) {
      await page.goto(path);
      await expect(page.getByRole("heading")).toBeVisible();
    }
  });

  test("agent signs in and opens desk", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await expect(page.getByRole("heading", { name: /loan applications/i })).toBeVisible();
    await expect(page.getByText("LOAN APPLICATION").first()).toBeVisible();
  });

  test("desk history and drafts load when signed in", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(AppRoutes.deskHistory);
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await page.goto(AppRoutes.deskDrafts);
    await expect(page.getByRole("heading", { name: /paused drafts/i })).toBeVisible();
  });

  test("folder A-1042 opens agreement from desk", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    const folderLink = page.getByRole("link", { name: /A-1042/i }).first();
    await expect(folderLink).toBeVisible();
    await folderLink.click();
    await expect(page).toHaveURL(/\/agreement/);
    await expect(
      page.getByRole("heading", { name: /loan agreement/i }),
    ).toBeVisible();
  });

  test("agreement flow for LMS_CREATED app (direct URL)", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(deskApplicationAgreement("A-1042"));
    await expect(
      page.getByRole("heading", { name: /loan agreement/i }),
    ).toBeVisible();
  });

  test("capture redirects to readiness when signed in", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(AppRoutes.capture);
    await expect(page).toHaveURL(new RegExp(`${captureStage("readiness")}$`));
    await expect(
      page.getByRole("heading", { name: /Is the customer ready/i }),
    ).toBeVisible();
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get(AppRoutes.apiOnboardingHealth);
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  test("protected desk redirects to login", async ({ page }) => {
    await page.goto(AppRoutes.desk);
    await expect(page).toHaveURL(/\/(\?|$)/);
  });
});
