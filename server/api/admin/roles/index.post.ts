import { createRole, validateRole } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  const input = validateRole(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid role" });
  }
  await simulateLatency(300);
  setResponseStatus(event, 201);
  return createRole(input);
});
