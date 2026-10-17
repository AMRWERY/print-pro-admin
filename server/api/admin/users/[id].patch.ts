import { emailTaken, updateOperator, validateOperator } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  const input = validateOperator(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid operator" });
  }
  if (emailTaken(input.email, id)) {
    throw createError({ statusCode: 409, statusMessage: "Email already in use", data: { reason: "email" } });
  }
  await simulateLatency(300);
  const result = updateOperator(id, input);
  if (!result.ok) throw accessError(result.reason);
  return result.value;
});
