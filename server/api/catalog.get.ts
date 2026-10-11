import { catalogProducts } from "../../app/data/catalog";

export default defineEventHandler(async () => {
  await simulateLatency();
  return catalogProducts;
});
