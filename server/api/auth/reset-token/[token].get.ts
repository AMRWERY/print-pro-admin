export default defineEventHandler((event) => forward(event, `/api/auth/reset-token/${segment(event, "token")}`));
