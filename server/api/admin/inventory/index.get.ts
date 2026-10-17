import { parseInventoryQuery, queryInventory } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryInventory(parseInventoryQuery(getQuery(event)));
});
