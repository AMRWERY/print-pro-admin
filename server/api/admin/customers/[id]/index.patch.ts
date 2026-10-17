import { customerDetail, emailTaken, findCustomer, updateCustomer, validateCustomer } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  if (!findCustomer(id)) {
    throw createError({ statusCode: 404, statusMessage: "Client not found" });
  }
  const input = validateCustomer(await readBody(event));
  if (!input) {
    throw createError({ statusCode: 400, statusMessage: "Invalid client" });
  }
  if (emailTaken(input.email, id)) {
    throw createError({ statusCode: 409, statusMessage: "Email already registered" });
  }
  await simulateLatency(300);
  updateCustomer(id, input);
  return customerDetail(id);
});
