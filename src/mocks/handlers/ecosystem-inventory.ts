import { http, HttpResponse } from "msw";
import { listInventoryItems, getInventoryRules } from "@/mocks/inventory-mock-state";
import { fieldUpstreamPath } from "@/mocks/handlers/upstream-path";

export const ecosystemInventoryHandlers = [
  http.get(fieldUpstreamPath("/bikes/assignable"), ({ request }) => {
    const url = new URL(request.url);
    const dealershipId = url.searchParams.get("dealershipId");
    const items = listInventoryItems(dealershipId);
    const rules = getInventoryRules();
    return HttpResponse.json({ items, rules });
  }),
];
