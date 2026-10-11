import { demoOrderHistory } from "../../../app/data/account-orders";

export default defineEventHandler(async () => {
  await simulateLatency();
  return demoOrderHistory();
});
