import { createItem } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  const result = createItem(await readBody(event));
  if (!result.ok) {
    throw createError({ statusCode: result.status, statusMessage: result.message });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return result.item;
});
