import { createProduct, skuExists, validateProductInput } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  const input = validateProductInput(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product" });
  }
  if (skuExists(input.sku)) {
    throw createError({ statusCode: 409, statusMessage: "SKU already exists" });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createProduct(input);
});
