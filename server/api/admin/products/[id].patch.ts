export default defineEventHandler((event) => forward(event, `/api/admin/products/${segment(event, "id")}`));
