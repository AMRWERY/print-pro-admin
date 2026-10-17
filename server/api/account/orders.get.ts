import { demoOrderHistory } from "~/data/account-orders";

export default defineEventHandler(async () => {
  await simulateLatency();
  return demoOrderHistory();
});
