import { expect, type Page } from "@playwright/test";
import {
  DEMO_AGENT_EMAIL,
  DEMO_AGENT_PASSWORD,
  DEMO_OTP_CODE,
} from "../../src/lib/global/auth/demo-credentials";
import { AppRoutes } from "../../src/lib/global/shared/routes";

const DESK_NAV_TIMEOUT_MS = 30_000;
const LOGIN_SUBMIT_TIMEOUT_MS = 20_000;

export async function waitForOfficerLoginFormReady(page: Page): Promise<void> {
  const emailInput = page.getByLabel("Email");
  await expect(emailInput).toBeVisible();
  await expect(emailInput).toBeEditable();
  // LoginScreen fires session probes on mount; wait so a late remount does not clear fills.
  await page
    .waitForResponse(
      (res) => res.url().includes("/api/auth/session") && res.ok(),
      { timeout: 15_000 },
    )
    .catch(() => undefined);
}

export async function fillOfficerLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  const emailInput = page.getByLabel("Email");
  const passwordInput = page.getByLabel("Password");
  await expect(emailInput).toBeEditable();
  await emailInput.fill(email);
  await expect(emailInput).toHaveValue(email);
  await passwordInput.fill(password);
  await expect(passwordInput).toHaveValue(password);
}

async function clickContinueAndWaitForLogin(page: Page): Promise<void> {
  const loginResponse = page.waitForResponse(
    (res) =>
      res.url().includes(AppRoutes.apiOnboardingAuthLogin) &&
      res.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  const loginRes = await loginResponse;
  expect(loginRes.ok()).toBeTruthy();
}

export async function submitOfficerLoginToOtp(page: Page): Promise<void> {
  await expect(async () => {
    await clickContinueAndWaitForLogin(page);
  }).toPass({ timeout: LOGIN_SUBMIT_TIMEOUT_MS });
  await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
}

export async function completeOfficerOtpSignIn(page: Page): Promise<void> {
  await page.getByLabel("Verification code").fill(DEMO_OTP_CODE);
  await Promise.all([
    page.waitForURL(
      (url) => url.pathname === AppRoutes.desk,
      { timeout: DESK_NAV_TIMEOUT_MS },
    ),
    page.getByRole("button", { name: "Verify & sign in" }).click(),
  ]);
}

export async function signInWithCredentials(
  page: Page,
  email: string,
  password: string,
  options?: { navigateHome?: boolean; waitForFormReady?: boolean },
): Promise<void> {
  if (options?.navigateHome !== false) {
    await page.goto(AppRoutes.home);
  }
  if (options?.waitForFormReady !== false) {
    await waitForOfficerLoginFormReady(page);
  }

  await expect(async () => {
    await fillOfficerLoginForm(page, email, password);
    await clickContinueAndWaitForLogin(page);
  }).toPass({ timeout: LOGIN_SUBMIT_TIMEOUT_MS });

  await expect(page.getByRole("heading", { name: "One more step" })).toBeVisible();
}

export async function signInAsOnboardingAgent(page: Page): Promise<void> {
  await signInWithCredentials(page, DEMO_AGENT_EMAIL, DEMO_AGENT_PASSWORD);
  await completeOfficerOtpSignIn(page);
}
