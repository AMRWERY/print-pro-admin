import { customerDetail } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  await simulateLatency(250);
  const detail = customerDetail(getRouterParam(event, "id") ?? "");
  if (!detail) {
    throw createError({ statusCode: 404, statusMessage: "Client not found" });
  }
  return detail;
});
