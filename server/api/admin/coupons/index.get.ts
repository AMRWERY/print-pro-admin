import { parseCouponQuery, queryCoupons } from "~/data/admin-coupons";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryCoupons(parseCouponQuery(getQuery(event)));
});
