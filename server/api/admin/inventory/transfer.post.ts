import { transferItem } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  const result = transferItem(await readBody(event));
  if (!result.ok) {
    throw createError({ statusCode: result.status, statusMessage: result.message });
  }
  await simulateLatency(350);
  return result.item;
});
