import { checkCategory, createCategory, validateCategory } from "~/data/admin-categories";

export default defineEventHandler(async (event) => {
  const input = validateCategory(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid category" });
  }
  const check = checkCategory(input);
  if (check === "slug") throw createError({ statusCode: 409, statusMessage: "Slug already in use" });
  if (check === "parent") throw createError({ statusCode: 400, statusMessage: "Invalid parent" });
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createCategory(input);
});
