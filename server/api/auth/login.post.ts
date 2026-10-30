type Session = { token: string; user: unknown };

// The API token is kept in an httpOnly cookie. The browser only ever receives the user.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string; remember?: boolean }>(event);
  const session = await callApi<Session>(event, "/api/auth/login", {
    method: "POST",
    body: { email: body?.email, password: body?.password, requireRole: "admin" },
  });
  startSession(event, session.token, body?.remember === true);
  return { user: session.user };
});
