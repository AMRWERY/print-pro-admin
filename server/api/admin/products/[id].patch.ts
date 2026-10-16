import {
  findProduct,
  getProductDetail,
  skuExists,
  updateProduct,
  updateProductFromForm,
  validateProductForm,
} from "~/data/admin-products";

// Edits a product. Send the whole editor form, or just `{ stock }` for a quick stock adjustment.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findProduct(id)) {
    throw createError({ statusCode: 404, statusMessage: "Product not found" });
  }

  const body = ((await readBody(event)) ?? {}) as Record<string, unknown>;
  const keys = Object.keys(body);

  if (keys.length === 1 && keys[0] === "stock") {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) {
      throw createError({ statusCode: 400, statusMessage: "Invalid stock" });
    }
    return updateProduct(id, { stock });
  }

  // Fields that are not sent keep their current value.
  const values = validateProductForm({ ...getProductDetail(id), ...body });
  if (!values) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product" });
  }
  if (skuExists(values.sku, id)) {
    throw createError({ statusCode: 409, statusMessage: "SKU already exists" });
  }
  await simulateLatency(350);
  return updateProductFromForm(id, values);
});
