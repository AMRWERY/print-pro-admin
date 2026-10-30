export default defineEventHandler((event) => forward(event, `/api/admin/orders/${segment(event, "id")}`));
