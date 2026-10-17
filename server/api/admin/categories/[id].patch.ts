import {
  checkCategory,
  findCategory,
  updateCategory,
  validateCategory,
} from "~/data/admin-categories";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findCategory(id)) {
    throw createError({ statusCode: 404, statusMessage: "Category not found" });
  }
  const input = validateCategory(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid category" });
  }
  const check = checkCategory(input, id);
  if (check === "slug")
    throw createError({
      statusCode: 409,
      statusMessage: "Slug already in use",
    });
  if (check === "parent")
    throw createError({ statusCode: 400, statusMessage: "Invalid parent" });
  await simulateLatency(300);
  return updateCategory(id, input);
});
