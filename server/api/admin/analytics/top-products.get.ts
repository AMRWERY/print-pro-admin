import { parseTopQuery, queryTopProducts } from "~/data/admin-analytics";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryTopProducts(parseTopQuery(getQuery(event)));
});
