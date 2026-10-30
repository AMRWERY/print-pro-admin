import type { H3Event } from "h3";

/** The sign-in cookie. httpOnly: the browser never sees the API token; only this server does. */
export const SESSION_COOKIE = "pp_session";
const SESSION_MAX_AGE = 60 * 60 * 12; // matches the API token lifetime

const apiBase = () => String(useRuntimeConfig().apiBase).replace(/\/+$/, "");

export const sessionToken = (event: H3Event) => getCookie(event, SESSION_COOKIE);

export const startSession = (event: H3Event, token: string, remember: boolean) =>
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: !import.meta.dev,
    path: "/",
    // Without "remember" this is a session cookie and ends with the browser.
    ...(remember ? { maxAge: SESSION_MAX_AGE } : {}),
  });

export const endSession = (event: H3Event) => deleteCookie(event, SESSION_COOKIE, { path: "/" });

interface CallOptions {
  method?: string;
  query?: Record<string, unknown>;
  body?: unknown;
}

/** Calls the PrintPro API as the signed-in user and turns its errors into this server's errors. */
export const callApi = async <T>(event: H3Event, path: string, opts: CallOptions = {}): Promise<T> => {
  const token = sessionToken(event);
  const ip = getRequestIP(event, { xForwardedFor: true });
  try {
    const res = await $fetch.raw<T>(apiBase() + path, {
      method: (opts.method ?? "GET") as "GET",
      query: opts.query,
      body: opts.body as Record<string, unknown> | undefined,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        // The API rate-limits by client address, so pass the real one along.
        ...(ip ? { "x-forwarded-for": ip } : {}),
      },
    });
    // Keep the API status (201 on create, 204 on empty), which $fetch would otherwise flatten to 200.
    setResponseStatus(event, res.status);
    return res._data as T;
  } catch (e) {
    const err = e as { statusCode?: number; status?: number; data?: { message?: string } };
    const statusCode = err.statusCode ?? err.status ?? 503;
    // The API said this session is no longer valid: drop the cookie so the app signs out.
    if (statusCode === 401 && token) endSession(event);
    throw createError({
      statusCode,
      statusMessage: statusCode === 503 ? "API unavailable" : undefined,
      message: err.data?.message ?? (statusCode === 503 ? "The server is unreachable. Try again shortly." : "Request failed"),
    });
  }
};

/** Sends this request on to the same path of the API: method, query string and JSON body. */
export const forward = async <T>(event: H3Event, path: string): Promise<T> => {
  const hasBody = !["GET", "HEAD", "DELETE"].includes(event.method);
  return callApi<T>(event, path, {
    method: event.method,
    query: getQuery(event),
    body: hasBody ? await readBody(event) : undefined,
  });
};

/** A path segment from the URL, made safe to put into an API path (no slashes, no ".."). */
export const segment = (event: H3Event, name: string): string => {
  const v = getRouterParam(event, name) ?? "";
  if (!v || v === "." || v === ".." || /[\\/]/.test(v)) throw createError({ statusCode: 400, message: "Bad request" });
  return encodeURIComponent(v);
};
