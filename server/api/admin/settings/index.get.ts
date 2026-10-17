import { readSettings } from "~/data/admin-settings";

export default defineEventHandler(async () => {
  await simulateLatency(300);
  return readSettings();
});
