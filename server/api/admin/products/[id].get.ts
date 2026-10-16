import { getProductDetail } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  const detail = getProductDetail(getRouterParam(event, "id") ?? "");
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }
  return detail;
});
