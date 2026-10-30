export default defineEventHandler((event) => forward(event, `/api/admin/categories/${segment(event, "id")}`));
