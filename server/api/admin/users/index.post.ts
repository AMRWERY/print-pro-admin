import { createOperator, emailTaken, validateOperator } from "~/data/admin-users";

export default defineEventHandler(async (event) => {
  const input = validateOperator(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid operator" });
  }
  if (emailTaken(input.email)) {
    throw createError({ statusCode: 409, statusMessage: "Email already in use", data: { reason: "email" } });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createOperator(input);
});
