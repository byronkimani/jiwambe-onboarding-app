import { expect, type Page } from "@playwright/test";
import { captureStage, AppRoutes } from "../../src/lib/global/shared/routes";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const TINY_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF",
  "utf8",
);

async function uploadFileAtIndex(
  page: Page,
  index: number,
  file: { name: string; mimeType: string; buffer: Buffer },
): Promise<void> {
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(index).setInputFiles(file);
}

async function waitForDocumentCompletes(
  page: Page,
  count: number,
): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await page.waitForResponse(
      (res) =>
        res.url().includes("/documents/") &&
        res.url().includes("/complete") &&
        res.request().method() === "POST" &&
        res.ok(),
      { timeout: 30_000 },
    );
  }
}

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
  _name: string,
  searchQuery = "0712 334 556",
): Promise<void> {
  await page.getByPlaceholder("07XX XXX XXX or ID number").fill(searchQuery);
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes("/v1/field/customers/search") &&
        res.request().method() === "POST" &&
        res.ok(),
      { timeout: 30_000 },
    ),
    page.getByRole("button", { name: "Search", exact: true }).click(),
  ]);
  await expect(page.getByText("Portal draft")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("0712 334 556")).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/capture\/identity/, { timeout: 30_000 }),
    page.getByRole("button", { name: "Continue with this applicant →" }).click(),
  ]);
}

export async function completeIdentityStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/identity/);
  await page.getByLabel("Full name (as on National ID)").fill("E2E Test Rider");
  await page.getByRole("button", { name: "Male", exact: true }).click();
  await page.locator('input[type="date"]').fill("1990-05-15");
  await page.getByLabel("Phone number").fill("0712334456");
  await page.getByLabel("Email address").fill("e2e.test@example.com");
  await page.locator("#identity-county").selectOption("Nairobi");
  await page.locator("#identity-subcounty").selectOption("Westlands");
  await page.locator("#identity-area").fill("Parklands");
  await page.locator("#identity-landmark").fill("Near Sarit Centre");
  await page.getByLabel("National ID number").fill("28459912");
  await page.locator("#identity-kra").fill("A012345678X");

  await uploadFileAtIndex(page, 0, {
    name: "id-front.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await uploadFileAtIndex(page, 1, {
    name: "id-back.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await uploadFileAtIndex(page, 2, {
    name: "kra.pdf",
    mimeType: "application/pdf",
    buffer: TINY_PDF,
  });
  await uploadFileAtIndex(page, 3, {
    name: "selfie.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });

  await waitForDocumentCompletes(page, 4);

  await expect(
    page.getByRole("button", { name: /^Continue$/i }),
  ).toBeEnabled({ timeout: 15_000 });
  await Promise.all([
    page.waitForURL(/\/capture\/dl/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeDlStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/dl/);
  await page.locator("select").first().selectOption("smart");
  await page.getByRole("textbox").fill("DL123456");
  await uploadFileAtIndex(page, 0, {
    name: "dl-front.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await uploadFileAtIndex(page, 1, {
    name: "dl-back.jpg",
    mimeType: "image/jpeg",
    buffer: TINY_PNG,
  });
  await waitForDocumentCompletes(page, 2);
  await expect(
    page.getByRole("button", { name: /^Continue$/i }),
  ).toBeEnabled({ timeout: 15_000 });
  await Promise.all([
    page.waitForURL(/\/capture\/cogc/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeCogcStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/cogc/);
  await page.locator("select").first().selectOption("have");
  await uploadFileAtIndex(page, 0, {
    name: "cogc.pdf",
    mimeType: "application/pdf",
    buffer: TINY_PDF,
  });
  await waitForDocumentCompletes(page, 1);
  await expect(
    page.getByRole("button", { name: /^Continue$/i }),
  ).toBeEnabled({ timeout: 15_000 });
  await Promise.all([
    page.waitForURL(/\/capture\/references/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeReferencesStage(page: Page): Promise<void> {
  const cards = page.locator("div.rounded-2xl.border");
  for (let i = 0; i < 3; i += 1) {
    const card = cards.nth(i);
    await card.getByPlaceholder("Name").fill(`Ref ${i + 1}`);
    await card.locator("input").nth(1).fill(`1234567${i}`);
    await card.locator("select").selectOption("friend");
    await card.getByPlaceholder(/07XX/i).fill(`71200000${i}`);
    await card.getByText("Called during this session").click();
  }
  await page
    .getByText("Customer consents to reference verification calls")
    .click();
  await Promise.all([
    page.waitForURL(/\/capture\/model/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function completeModelStage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/capture\/model/);
  await page.getByRole("button", { name: "FLEET", exact: true }).click();
  await page.getByRole("button", { name: /active bolt driver/i }).click();
  await Promise.all([
    page.waitForURL(/\/capture\/product/, { timeout: 30_000 }),
    clickContinue(page),
  ]);
}

export async function waitForProductCatalog(page: Page): Promise<void> {
  await page.waitForResponse(
    (res) =>
      res.url().includes("/v1/field/products") && res.ok(),
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
  options?: { catalogReady?: boolean; productReady?: boolean },
): Promise<void> {
  if (!options?.productReady) {
    if (!options?.catalogReady) {
      await waitForProductCatalog(page);
    }
    await page.getByRole("button", { name: "Spiro TVS" }).click();
    await page.waitForResponse(
      (res) =>
        res.url().includes("/v1/field/products/quote") &&
        res.request().method() === "POST" &&
        res.ok(),
      { timeout: 30_000 },
    );
    await expect(page.getByText(/Financing calculator/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Daily installment:/i)).toBeVisible({
      timeout: 15_000,
    });
  }
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
  await completeProductStageWithStk(page);
  await completeBikeStage(page);
  await submitFromReview(page);
  return ref;
}
