import { deleteProducts } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  await simulateLatency(300);
  if (!deleteProducts([id])) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }
  return { deleted: 1 };
});
