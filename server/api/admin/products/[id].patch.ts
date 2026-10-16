import { skuExists, updateProduct, validateProductInput, findProduct } from "~/data/admin-products";

// Edits a product. Send the full form, or just `{ stock }` for a quick stock adjustment.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  const current = findProduct(id);
  if (!current) {
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

  const input = validateProductInput({ ...current, ...body });
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid product" });
  }
  if (skuExists(input.sku, id)) {
    throw createError({ statusCode: 409, statusMessage: "SKU already exists" });
  }
  await simulateLatency(300);
  return updateProduct(id, input);
});
