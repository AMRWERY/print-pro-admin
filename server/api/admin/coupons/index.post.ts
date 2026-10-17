import { codeTaken, createCoupon, validateCoupon } from "~/data/admin-coupons";

export default defineEventHandler(async (event) => {
  const input = validateCoupon(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid coupon" });
  }
  if (codeTaken(input.code)) {
    throw createError({ statusCode: 409, statusMessage: "Code already in use" });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createCoupon(input);
});
