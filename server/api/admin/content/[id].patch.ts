export default defineEventHandler((event) => forward(event, `/api/admin/content/${segment(event, "id")}`));
