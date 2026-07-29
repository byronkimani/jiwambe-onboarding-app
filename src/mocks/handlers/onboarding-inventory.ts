import { http, HttpResponse } from "msw";
import { listInventoryItems, getInventoryRules } from "@/mocks/inventory-mock-state";
import { upstreamPath } from "@/mocks/handlers/upstream-path";

/** Dealership stock — read-only; mirrors future upstream inventory feed. */
export const onboardingInventoryHandlers = [
  http.get(upstreamPath("/onboarding/inventory"), ({ request }) => {
    const url = new URL(request.url);
    const dealershipId = url.searchParams.get("dealershipId");
    const items = listInventoryItems(dealershipId);
    const rules = getInventoryRules();
    return HttpResponse.json({ items, rules });
  }),
];
