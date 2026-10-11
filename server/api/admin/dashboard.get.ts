import { dashboardSummary } from "../../../app/data/admin-dashboard";

export default defineEventHandler(async () => {
  await simulateLatency();
  return dashboardSummary;
});
