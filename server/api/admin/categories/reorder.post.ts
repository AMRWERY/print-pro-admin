import { reorderCategories } from "~/data/admin-categories";

// Saves the order of one sibling group: { parentId: string | null, ids: string[] }.
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { parentId?: unknown; ids?: unknown } | null;
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length || ids.length > 100 || !reorderCategories(parentId, ids)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  }
  return { ok: true };
});
