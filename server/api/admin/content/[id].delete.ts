import { deleteBlock } from "~/data/admin-content";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  if (!deleteBlock(getRouterParam(event, "id") ?? "")) {
    throw createError({ statusCode: 404, statusMessage: "Content block not found" });
  }
  return { deleted: 1 };
});
