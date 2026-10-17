import { bulkOperators, isBulkAction } from "~/data/admin-users";

// Suspend, restore, revoke sessions or delete several operators: { ids: string[], action }.
// Protected operators (yourself, the last Super Curator) are skipped and counted.
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as { ids?: unknown; action?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (!ids.length || ids.length > 100 || !isBulkAction(body?.action)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request" });
  }
  await simulateLatency(400);
  return bulkOperators(ids, body.action);
});
