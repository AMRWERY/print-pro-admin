export default defineEventHandler((event) => forward(event, `/api/admin/coupons/${segment(event, "id")}`));
