import { deleteProducts } from "~/data/admin-products";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length || ids.length > 100) {
    throw createError({ statusCode: 400, statusMessage: "Invalid selection" });
  }
  await simulateLatency(400);
  return { deleted: deleteProducts(ids) };
});
