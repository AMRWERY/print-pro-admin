import { deleteCustomers } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  if (!deleteCustomers([getRouterParam(event, "id") ?? ""])) {
    throw createError({ statusCode: 404, statusMessage: "Client not found" });
  }
  return { deleted: 1 };
});
