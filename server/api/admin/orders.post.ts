import {
  createOrder,
  validateCreateOrder,
} from "~/data/admin-orders";

export default defineEventHandler(async (event) => {
  const input = validateCreateOrder(await readBody(event));
  if (!input) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid order",
    });
  }
  await simulateLatency(400);
  setResponseStatus(event, 201);
  return createOrder(input);
});
