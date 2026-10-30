// Tokens are not tracked server-side, so signing out is dropping the cookie.
export default defineEventHandler((event) => {
  endSession(event);
  setResponseStatus(event, 204);
  return null;
});
