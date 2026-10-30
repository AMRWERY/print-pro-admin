export default defineEventHandler((event) => forward(event, `/api/admin/inventory/items/${segment(event, "id")}`));
