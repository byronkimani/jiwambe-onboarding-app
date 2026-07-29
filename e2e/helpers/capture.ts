import { expect, type Page } from "@playwright/test";
import { captureStage, AppRoutes } from "../../src/lib/global/shared/routes";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export async function clickContinue(page: Page): Promise<void> {
  const primary = page.getByRole("button", {
    name: /^(Continue|Customer is ready — start|Submit to backoffice)$/i,
  });
  await primary.click();
}

export async function completeReadiness(page: Page): Promise<void> {
  await page.getByRole("button", { name: /select all/i }).click();
  await Promise.all([
    page.waitForURL(/\/capture\/lookup\?application=/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function selectPortalCustomer(
  page: Page,
  name: string,
): Promise<void> {
  await page.getByRole("button", { name: new RegExp(name, "i") }).click();
  await Promise.all([
    page.waitForURL(/\/capture\/identity/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeIdentityStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/identity/);
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("E2E Test Rider");
  await textboxes.nth(1).fill("0712334456");
  await textboxes.nth(2).fill("12345678");
  await textboxes.nth(3).fill("Nairobi");
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(0).setInputFiles({
    name: "id.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await fileInputs.nth(1).setInputFiles({
    name: "selfie.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await Promise.all([
    page.waitForURL(/\/capture\/dl/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeDlStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/dl/);
  await page.locator("select").first().selectOption("smart");
  await page.getByRole("textbox").fill("DL123456");
  await Promise.all([
    page.waitForURL(/\/capture\/cogc/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeCogcStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/cogc/);
  await page.locator("select").first().selectOption("have");
  await Promise.all([
    page.waitForURL(/\/capture\/references/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeReferencesStage(page: Page): Promise<void> {
  for (let i = 0; i < 3; i += 1) {
    await page.getByPlaceholder("Name").nth(i).fill(`Ref ${i + 1}`);
    await page.getByPlaceholder("Relationship").nth(i).fill("Friend");
    await page.getByPlaceholder(/07XX/i).nth(i).fill(`71200000${i}`);
  }
  await page
    .getByText("Customer consents to reference verification calls")
    .click();
  await clickContinue(page);
}

export async function completeModelStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/model/);
  await page.getByRole("button", { name: "FLEET" }).click();
  await Promise.all([
    page.waitForURL(/\/capture\/product/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function waitForProductCatalog(page: Page): Promise<void> {
  await page.waitForResponse(
    (res) =>
      res.url().includes("/api/onboarding/catalog/products") && res.ok(),
    { timeout: 30_000 },
  );
  await expect(page.getByRole("button", { name: "Spiro TVS" })).toBeVisible({
    timeout: 15_000,
  });
}

const E2E_MPESA_RECEIPT = "UGE2ETEST01";

async function confirmDepositWithFallbackUi(page: Page): Promise<void> {
  await page.getByRole("button", { name: /Enter M-Pesa code instead/i }).click();
  await page
    .getByRole("textbox", { name: "M-Pesa confirmation code" })
    .fill(E2E_MPESA_RECEIPT);
  await page.getByRole("button", { name: "Verify code" }).click();
  await expect(page.getByText(/M-Pesa deposit verified/i)).toBeVisible({
    timeout: 30_000,
  });
}

export async function completeProductStageWithStk(
  page: Page,
  _referenceCode: string,
): Promise<void> {
  await waitForProductCatalog(page);
  await page.getByRole("button", { name: "Spiro TVS" }).click();

  await page.getByRole("button", { name: "Send STK push" }).click();
  try {
    await expect(page.getByText(/M-Pesa deposit verified/i)).toBeVisible({
      timeout: 25_000,
    });
  } catch {
    await confirmDepositWithFallbackUi(page);
  }

  await expect(
    page.getByRole("button", { name: "Continue" }),
  ).toBeEnabled({ timeout: 15_000 });
  await clickContinue(page);
}

export async function completeBikeStage(page: Page): Promise<void> {
  await expect(page.getByText(/Loading dealership stock/i)).toBeHidden({
    timeout: 15_000,
  });
  const bike = page.locator("button").filter({ hasText: /^K[A-Z]/ }).first();
  await expect(bike).toBeVisible({ timeout: 15_000 });
  await bike.click();
  await clickContinue(page);
}

export async function submitFromReview(page: Page): Promise<void> {
  await expect(
    page.getByRole("button", { name: /submit to backoffice/i }),
  ).toBeEnabled({ timeout: 15_000 });
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/submit") &&
        res.request().method() === "POST" &&
        res.ok(),
      { timeout: 30_000 },
    ),
    page.getByRole("button", { name: /submit to backoffice/i }).click(),
  ]);
  await expect(page).toHaveURL(AppRoutes.desk, { timeout: 30_000 });
}

export async function runCaptureToProductStage(page: Page): Promise<string> {
  await page.goto(captureStage("readiness"));
  await completeReadiness(page);
  await selectPortalCustomer(page, "Grace Wanjiku");
  await completeIdentityStage(page);
  await completeDlStage(page);
  await completeCogcStage(page);
  await completeReferencesStage(page);
  await completeModelStage(page);
  return new URL(page.url()).searchParams.get("application") ?? "A-unknown";
}

export async function runCaptureThroughSubmit(page: Page): Promise<string> {
  const ref = await runCaptureToProductStage(page);
  await completeProductStageWithStk(page, ref);
  await completeBikeStage(page);
  await submitFromReview(page);
  return ref;
}
