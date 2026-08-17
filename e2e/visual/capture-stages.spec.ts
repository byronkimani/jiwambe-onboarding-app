import { expect, test, type Page } from "@playwright/test";
import { CAPTURE_STAGES } from "../../src/lib/onboarding/capture/stages";
import { captureStage, AppRoutes } from "../../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "../helpers/sign-in";
import {
  completeBikeStage,
  completeCogcStage,
  completeDlStage,
  completeIdentityStage,
  completeModelStage,
  completeProductStageWithStk,
  completeReadiness,
  completeReferencesStage,
  selectPortalCustomer,
  waitForProductCatalog,
} from "../helpers/capture";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

async function waitForCaptureStageReady(page: Page, stageLabel: string) {
  await expect(page.getByRole("heading", { name: stageLabel })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("Loading minimums…")).toBeHidden({
    timeout: 20_000,
  });
}

async function screenshotStage(
  page: Page,
  stageKey: string,
  options?: { maxDiffPixels?: number },
) {
  await expect(page).toHaveScreenshot(`capture-${stageKey}.png`, {
    maxDiffPixels: options?.maxDiffPixels ?? 4000,
  });
}

test.describe("capture stage visuals", () => {
  test("screenshot baselines per stage", async ({ page }) => {
    test.setTimeout(180_000);

    await signInAsOnboardingAgent(page);
    await page.goto(captureStage("readiness"));
    await waitForCaptureStageReady(page, "Is the customer ready?");
    await screenshotStage(page, "readiness");

    await completeReadiness(page);
    await waitForCaptureStageReady(page, "Customer lookup");
    await page.getByPlaceholder("07XX XXX XXX or ID number").fill("0712 334 556");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("Portal draft")).toBeVisible({ timeout: 15_000 });
    await screenshotStage(page, "lookup");

    await selectPortalCustomer(page, "Grace Wanjiku");
    await waitForCaptureStageReady(page, "Identity & contact");
    await screenshotStage(page, "identity");

    await completeIdentityStage(page);
    await waitForCaptureStageReady(page, "Driving licence");
    await screenshotStage(page, "dl");

    await completeDlStage(page);
    await waitForCaptureStageReady(page, "Good conduct");
    await screenshotStage(page, "cogc");

    await completeCogcStage(page);
    await waitForCaptureStageReady(page, "References");
    await screenshotStage(page, "references");

    await completeReferencesStage(page);
    await waitForCaptureStageReady(page, "Operating model");
    await screenshotStage(page, "model");

    await completeModelStage(page);
    await waitForCaptureStageReady(page, "Product, financing & deposit");
    await waitForProductCatalog(page);
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
    await page.getByRole("button", { name: "18 months", exact: true }).click();
    await expect(page.getByRole("button", { name: "Send STK push" })).toBeVisible({
      timeout: 15_000,
    });
    await screenshotStage(page, "product", { maxDiffPixels: 20_000 });

    await completeProductStageWithStk(page, { productReady: true });
    await waitForCaptureStageReady(page, "Bike assignment");
    await expect(page.getByText(/Loading dealership stock/i)).toBeHidden({
      timeout: 15_000,
    });
    await screenshotStage(page, "bike");

    await completeBikeStage(page);
    await waitForCaptureStageReady(page, "Review & submit");
    await screenshotStage(page, "review");

    expect(CAPTURE_STAGES.length).toBeGreaterThan(0);
  });
});
