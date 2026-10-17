import { deleteItem } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  if (!deleteItem(getRouterParam(event, "id") ?? "").ok) {
    throw createError({ statusCode: 404, statusMessage: "Item not found" });
  }
  return { deleted: 1 };
});
