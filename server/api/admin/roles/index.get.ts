import { listRoles } from "~/data/admin-users";

export default defineEventHandler(async () => {
  await simulateLatency(250);
  return { rows: listRoles() };
});
