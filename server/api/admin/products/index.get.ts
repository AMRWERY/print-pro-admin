import { parseProductsQuery, queryProducts } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryProducts(parseProductsQuery(getQuery(event)));
});
