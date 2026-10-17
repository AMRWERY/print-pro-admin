import { codeTaken, findCoupon, updateCoupon, validateCoupon } from "~/data/admin-coupons";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findCoupon(id)) {
    throw createError({ statusCode: 404, statusMessage: "Coupon not found" });
  }
  const input = validateCoupon(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid coupon" });
  }
  if (codeTaken(input.code, id)) {
    throw createError({ statusCode: 409, statusMessage: "Code already in use" });
  }
  await simulateLatency(300);
  return updateCoupon(id, input);
});
