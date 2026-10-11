import { isRangeKey, revenueSeries } from "../../../app/data/admin-dashboard";

export default defineEventHandler(async (event) => {
  const { range } = getQuery(event);
  if (!isRangeKey(range)) {
    throw createError({ statusCode: 400, statusMessage: "Unknown range" });
  }
  await simulateLatency(250);
  return revenueSeries(range);
});
