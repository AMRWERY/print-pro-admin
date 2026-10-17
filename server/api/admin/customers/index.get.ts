import { parseCustomerQuery, queryCustomers } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  return queryCustomers(parseCustomerQuery(getQuery(event)));
});
