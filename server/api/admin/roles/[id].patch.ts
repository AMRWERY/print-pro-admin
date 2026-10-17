import { updateRole, validateRole } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  const input = validateRole(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid role" });
  }
  await simulateLatency(350);
  const result = updateRole(getRouterParam(event, "id") ?? "", input);
  if (!result.ok) throw accessError(result.reason);
  return result.value;
});
