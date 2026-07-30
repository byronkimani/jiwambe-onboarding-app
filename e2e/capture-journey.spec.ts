import { expect, test } from "@playwright/test";
import { AppRoutes, captureStage } from "../src/lib/global/shared/routes";
import { signInAsOnboardingAgent } from "./helpers/sign-in";
import {
  completeReadiness,
  runCaptureThroughSubmit,
  runCaptureToProductStage,
} from "./helpers/capture";

test.beforeEach(async ({ request, context }) => {
  await context.clearCookies();
  const response = await request.post(AppRoutes.apiOnboardingE2eResetMocks);
  expect(response.ok()).toBeTruthy();
});

test.describe("capture journey", () => {
  test.describe.configure({ mode: "serial" });

  test("catalog and STK on product stage", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    const ref = await runCaptureToProductStage(page);
    const stk = await page.request.post(AppRoutes.apiPaymentsStk, {
      data: { applicationReferenceCode: ref, depositKes: 10_000 },
    });
    expect(stk.ok()).toBeTruthy();
    const stkBody = (await stk.json()) as { checkoutId: string };
    const pending = await page.request.post(
      AppRoutes.apiPaymentsValidate,
      {
        data: {
          applicationReferenceCode: ref,
          checkoutId: stkBody.checkoutId,
        },
      },
    );
    expect((await pending.json()).status).toBe("pending");
    const verified = await page.request.post(
      AppRoutes.apiPaymentsValidate,
      {
        data: {
          applicationReferenceCode: ref,
          checkoutId: stkBody.checkoutId,
        },
      },
    );
    expect((await verified.json()).status).toBe("verified");
    await expect(page.getByRole("button", { name: "Spiro TVS" })).toBeVisible();
  });

  test("full capture submits to desk queue", async ({ page }) => {
    test.setTimeout(120_000);
    await signInAsOnboardingAgent(page);
    const ref = await runCaptureThroughSubmit(page);
    await page.reload();
    await expect(page.getByText(ref, { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("disqualified draft absent from main desk", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(captureStage("readiness"));
    await completeReadiness(page);
    const ref = new URL(page.url()).searchParams.get("application");
    expect(ref).toBeTruthy();
    await page.getByRole("button", { name: "Disqualify" }).click();
    await page.getByPlaceholder("Reason (required)").fill("E2E disqualify test");
    await page.getByRole("button", { name: "Disqualify" }).last().click();
    await expect(page).toHaveURL(AppRoutes.desk, { timeout: 20_000 });
    await expect(
      page.getByRole("link", { name: new RegExp(ref!, "i") }),
    ).toHaveCount(0);
  });

  test("seed A-1018 on history not on queue", async ({ page }) => {
    await signInAsOnboardingAgent(page);
    await page.goto(AppRoutes.desk);
    await expect(
      page.getByRole("link", { name: /A-1018/i }),
    ).toHaveCount(0);
    await page.goto(AppRoutes.deskHistory);
    await expect(
      page.getByRole("link", { name: /A-1018/i }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("catalog inventory deposits APIs require auth", async ({ request }) => {
    for (const path of [
      AppRoutes.apiCatalogProducts,
      AppRoutes.apiInventory,
      AppRoutes.apiPaymentsStk,
    ]) {
      const response = await request.get(path);
      if (path === AppRoutes.apiPaymentsStk) {
        const post = await request.post(path, {
          data: { applicationReferenceCode: "A-1", depositKes: 1000 },
        });
        expect(post.status()).toBe(401);
      } else {
        expect(response.status()).toBe(401);
      }
    }
    const validate = await request.post(AppRoutes.apiPaymentsValidate, {
      data: { applicationReferenceCode: "A-1", mpesaReceipt: "UGE2ETEST01" },
    });
    expect(validate.status()).toBe(401);
  });
});
