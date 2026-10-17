import { validateSettings, writeSettings } from "~/data/admin-settings";

// Replaces all settings at once; the whole object is checked first, so a bad value saves nothing.
export default defineEventHandler(async (event) => {
  const next = validateSettings(await readBody(event));
  if (!next) {
    throw createError({ statusCode: 400, statusMessage: "Invalid settings" });
  }
  await simulateLatency(500);
  return writeSettings(next);
});
