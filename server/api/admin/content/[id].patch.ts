import { findBlock, updateBlock, validateBlock } from "~/data/admin-content";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findBlock(id)) {
    throw createError({ statusCode: 404, statusMessage: "Content block not found" });
  }
  const input = validateBlock(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid content block" });
  }
  await simulateLatency(300);
  return updateBlock(id, input);
});
