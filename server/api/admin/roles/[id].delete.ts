import { deleteRole } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  await simulateLatency(300);
  const result = deleteRole(getRouterParam(event, "id") ?? "");
  if (!result.ok) throw accessError(result.reason);
  return { deleted: 1 };
});
