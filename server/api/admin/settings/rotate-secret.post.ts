import { rotateSecret } from "~/data/admin-settings";

// Issues a new webhook signing secret. The secret itself is shown elsewhere; this returns its last four characters.
export default defineEventHandler(async () => {
  await simulateLatency(600);
  return rotateSecret();
});
