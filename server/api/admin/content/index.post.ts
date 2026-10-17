import { createBlock, validateBlock } from "~/data/admin-content";

export default defineEventHandler(async (event) => {
  const input = validateBlock(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid content block" });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createBlock(input);
});
