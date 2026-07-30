import { http, HttpResponse } from "msw";
import {
  mockDepositStk,
  mockDepositValidate,
} from "@/mocks/deposits-mock-state";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

export const ecosystemPaymentsHandlers = [
  http.post(upstreamPath("/payments/stk"), async ({ request }) => {
    const body = await request.json();
    const result = mockDepositStk(body);
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({
      checkoutId: result.checkoutId,
      status: result.status,
      expiresAt: result.expiresAt,
    });
  }),

  http.post(upstreamPath("/payments/validate"), async ({ request }) => {
    const body = await request.json();
    const result = mockDepositValidate(body);
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({
      status: result.status,
      mpesaReceipt: result.mpesaReceipt ?? null,
      depositPayment: result.depositPayment ?? null,
      applicationVersion: result.applicationVersion,
    });
  }),
];
