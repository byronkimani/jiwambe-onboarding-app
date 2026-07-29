import { expect, test } from "@playwright/test";
import {
  DEMO_ACTIVATION_TOKEN,
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
  DEMO_PENDING_AGENT_EMAIL,
  DEMO_RESET_TOKEN,
} from "../src/lib/global/auth/demo-credentials";
import {
  AppRoutes,
  captureStage,
  deskApplicationAgreement,
} from "../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "./helpers/sign-in";
import {
  gotoActivatePasswordForm,
  gotoResetPasswordForm,
} from "./helpers/auth-token-pages";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test.describe("shell routes", () => {
  test.describe.configure({ mode: "serial" });
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
    await expect(
      page.getByRole("heading", { name: /loan applications/i }),
    ).toBeVisible();
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
    await expect(page.getByText("Loading…")).toBeHidden({ timeout: 20_000 });
    await page.goto(deskApplicationAgreement("A-1042"));
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

  test("agent signs out from profile", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(AppRoutes.deskProfile);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 15_000 });
    await page.goto(AppRoutes.desk);
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test("CRM activation sets password then agent signs in", async ({ page }) => {
    const newPassword = "SecurePass99";
    await gotoActivatePasswordForm(page, DEMO_ACTIVATION_TOKEN);
    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\?passwordSet=1/);
    await page.getByPlaceholder("you@example.com").fill(DEMO_PENDING_AGENT_EMAIL);
    await page.getByPlaceholder("••••••••").fill(newPassword);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
    await page.getByLabel("Verification code").fill(DEMO_OTP_CODE);
    await page.getByRole("button", { name: "Verify & sign in" }).click();
    await expect(page).toHaveURL(AppRoutes.desk, { timeout: 30_000 });
  });

  test("capture redirects to readiness when signed in", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(AppRoutes.capture);
    await expect(page).toHaveURL(new RegExp(`${captureStage("readiness")}$`));
    await expect(
      page.getByRole("heading", { name: /Is the customer ready/i }),
    ).toBeVisible();
  });

  test("protected desk redirects to login", async ({ page }) => {
    await page.goto(AppRoutes.desk);
    await expect(page).toHaveURL(/\/(\?|$)/);
  });

  test("protected applications API returns 401 when anonymous", async ({
    request,
  }) => {
    const response = await request.get(AppRoutes.apiOnboardingApplications);
    expect(response.status()).toBe(401);
  });

  test("applications list returns summaries when signed in", async ({
    page,
  }) => {
    await signInAsOnboardingAgent(page);
    await page.request.post(AppRoutes.apiOnboardingE2eResetMocks);
    const response = await page.request.get(AppRoutes.apiOnboardingApplications);
    expect(response.ok()).toBeTruthy();
    const body = (await response.json()) as {
      applications: { referenceCode: string; lifecycleState: string }[];
    };
    expect(Array.isArray(body.applications)).toBe(true);
    expect(
      body.applications.some((a) => a.referenceCode === "A-1018"),
    ).toBe(false);
  });

  test("health endpoint responds", async ({ request }) => {
    const response = await request.get(AppRoutes.apiOnboardingHealth);
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  test("forgot password then reset link sets password and agent signs in", async ({
    page,
  }) => {
    const newPassword = "SecureReset99";
    await page.goto(AppRoutes.forgotPassword);
    await page.getByPlaceholder("you@example.com").fill(DEMO_AGENT_EMAIL);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText(/reset instructions/i);

    await gotoResetPasswordForm(page, DEMO_RESET_TOKEN);
    await page.getByLabel("New password").fill(newPassword);
    await page.getByLabel("Confirm password").fill(newPassword);
    await page.getByRole("button", { name: "Save password" }).click();
    await expect(page).toHaveURL(/\?passwordSet=1/);

    await page.getByPlaceholder("you@example.com").fill(DEMO_AGENT_EMAIL);
    await page.getByPlaceholder("••••••••").fill(newPassword);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
    await page.getByLabel("Verification code").fill(DEMO_OTP_CODE);
    await page.getByRole("button", { name: "Verify & sign in" }).click();
    await expect(page).toHaveURL(AppRoutes.desk, { timeout: 30_000 });
  });
});
