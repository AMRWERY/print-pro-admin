import { parseOrdersQuery, queryOrders } from "~/data/admin-orders";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryOrders(parseOrdersQuery(getQuery(event)));
});
