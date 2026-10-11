import { findProduct, getProductDetail } from "../../../app/data/product-details";

export default defineEventHandler(async (event) => {
  await simulateLatency();
  const product = findProduct(getRouterParam(event, "id") ?? "");
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }
  const detail = getProductDetail(product);
  const related = detail.related
    .map((id) => findProduct(id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  return { product, detail, related };
});
