import { updateItem } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  const result = updateItem(getRouterParam(event, "id") ?? "", await readBody(event));
  if (!result.ok) {
    throw createError({ statusCode: result.status, statusMessage: result.message });
  }
  await simulateLatency(300);
  return result.item;
});
