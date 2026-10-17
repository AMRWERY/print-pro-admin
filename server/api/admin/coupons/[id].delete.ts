import { bulkCoupons } from "~/data/admin-coupons";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  if (!bulkCoupons([getRouterParam(event, "id") ?? ""], "delete")) {
    throw createError({ statusCode: 404, statusMessage: "Coupon not found" });
  }
  return { deleted: 1 };
});
