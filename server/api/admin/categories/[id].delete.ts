import { deleteCategory, findCategory } from "~/data/admin-categories";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findCategory(id)) {
    throw createError({ statusCode: 404, statusMessage: "Category not found" });
  }
  await simulateLatency(300);
  return { deleted: deleteCategory(id) };
});
