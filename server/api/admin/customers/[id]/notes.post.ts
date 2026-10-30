export default defineEventHandler((event) => forward(event, `/api/admin/customers/${segment(event, "id")}/notes`));
