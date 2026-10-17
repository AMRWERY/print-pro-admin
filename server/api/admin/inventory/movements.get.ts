import { listMovements } from "~/data/admin-inventory";

export default defineEventHandler(async (event) => {
  await simulateLatency(200);
  return listMovements(Number(getQuery(event).limit) || 8);
});
