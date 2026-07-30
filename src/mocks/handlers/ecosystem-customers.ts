import { http, HttpResponse } from "msw";
import {
  mockCustomerLookup,
} from "@/mocks/applications-mock-state";
import {
  customerLookupRequestSchema,
  normalizeCustomerLookupRequest,
} from "@/lib/onboarding/schemas/application-schemas";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

export const ecosystemCustomersHandlers = [
  http.post(upstreamPath("/customers/search"), async ({ request }) => {
    const body = await request.json();
    const parsed = customerLookupRequestSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    const normalized = normalizeCustomerLookupRequest(parsed.data);
    if (!normalized.ok) {
      return HttpResponse.json(
        { error: "invalid_body", message: normalized.message },
        { status: 400 },
      );
    }
    const result = mockCustomerLookup({
      phone: normalized.phone,
      nationalId: normalized.nationalId,
    });
    if (!result.ok) {
      return HttpResponse.json({ error: result.error }, { status: result.status });
    }
    return HttpResponse.json({ matches: result.matches });
  }),
];
