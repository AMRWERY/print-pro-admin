import { addCustomerNote, customerDetail } from "~/data/admin-customers";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id") ?? "";
  const body = (await readBody(event)) as { text?: unknown; urgent?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 1 || text.length > 600) {
    throw createError({ statusCode: 400, statusMessage: "Invalid note" });
  }
  await simulateLatency(250);
  if (!addCustomerNote(id, text, body?.urgent === true)) {
    throw createError({ statusCode: 404, statusMessage: "Client not found" });
  }
  setResponseStatus(event, 201);
  return customerDetail(id);
});
