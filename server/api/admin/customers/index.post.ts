import { createCustomer, emailTaken, validateCustomer } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  const input = validateCustomer(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid client" });
  }
  if (emailTaken(input.email)) {
    throw createError({ statusCode: 409, statusMessage: "Email already registered" });
  }
  await simulateLatency(350);
  setResponseStatus(event, 201);
  return createCustomer(input);
});
