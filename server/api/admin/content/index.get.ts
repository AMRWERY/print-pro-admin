import { parseBlockQuery, queryBlocks } from "~/data/admin-content";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryBlocks(parseBlockQuery(getQuery(event)));
});
