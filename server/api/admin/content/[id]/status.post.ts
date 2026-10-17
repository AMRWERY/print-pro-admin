import { setBlockStatus } from "~/data/admin-content";

// Publish or unpublish one block: { status: "published" | "draft" }.
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { status?: unknown } | null;
  if (body?.status !== "published" && body?.status !== "draft") {
    throw createError({ statusCode: 400, statusMessage: "Invalid status" });
  }
  await simulateLatency(250);
  const row = setBlockStatus(getRouterParam(event, "id") ?? "", body.status);
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "Content block not found" });
  }
  return row;
});
