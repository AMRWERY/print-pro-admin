import { isOrderSlug, isOrderStage, orderDetail, setOrderStage } from "~/data/admin-orders";

// Moves a requisition to another pipeline stage (including releasing escrow).
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = (await readBody(event)) as { stage?: unknown } | null;
  if (!isOrderSlug(id) || !isOrderStage(body?.stage)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request" });
  }
  await simulateLatency(350);
  if (!setOrderStage(id, body.stage)) {
    throw createError({ statusCode: 404, statusMessage: "Requisition not found" });
  }
  return orderDetail(id);
});
