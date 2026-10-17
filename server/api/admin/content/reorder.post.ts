import { reorderBlocks } from "~/data/admin-content";

// Put the given blocks in a new order, within the positions they already hold: { ids: string[] }.
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { ids?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length < 2 || ids.length > 100 || !reorderBlocks(ids)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid order" });
  }
  await simulateLatency(200);
  return { ok: true };
});
