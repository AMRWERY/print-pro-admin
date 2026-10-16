import { createProductFromForm, skuExists, validateProductForm } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  const values = validateProductForm(await readBody(event));
  if (!values) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product" });
  }
  if (skuExists(values.sku)) {
    throw createError({ statusCode: 409, statusMessage: "SKU already exists" });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createProductFromForm(values);
});
