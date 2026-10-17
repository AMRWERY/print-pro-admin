import { bulkCoupons, isBulkAction } from "~/data/admin-coupons";

// Pause, resume, archive or delete several coupons at once: { ids: string[], action }.
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { ids?: unknown; action?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length || ids.length > 100 || !isBulkAction(body?.action)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request" });
  }
  await simulateLatency(400);
  return { changed: bulkCoupons(ids, body.action) };
});
