import { isOrderSlug, orderDetail } from "~/data/admin-orders";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!isOrderSlug(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid requisition ID" });
  }
  await simulateLatency(300);
  const detail = orderDetail(id);
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: "Requisition not found" });
  }
  return detail;
});
