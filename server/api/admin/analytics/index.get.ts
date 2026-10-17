import { buildAnalytics, parseAnalyticsQuery } from "~/data/admin-analytics";

export default defineEventHandler(async (event) => {
  await simulateLatency(350);
  return buildAnalytics(parseAnalyticsQuery(getQuery(event)));
});
