import { parseOperatorQuery, queryOperators } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryOperators(parseOperatorQuery(getQuery(event)));
});
