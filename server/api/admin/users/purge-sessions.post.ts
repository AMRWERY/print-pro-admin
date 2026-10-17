import { purgeSessions } from "~/data/admin-users";

// Ends every open session except the signed-in admin's own.
export default defineEventHandler(async () => {
  await simulateLatency(600);
  return { ended: purgeSessions() };
});
