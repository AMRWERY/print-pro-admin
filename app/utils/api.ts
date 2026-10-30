type ApiError = { statusCode?: number; status?: number; data?: { message?: string }; message?: string };

/** HTTP status of a failed request, or 0 when there was none (offline). */
export const statusOf = (e: unknown): number => (e as ApiError)?.statusCode ?? (e as ApiError)?.status ?? 0;

/** The server's own message for a failed request ("Only 2 of X in stock"), or "". */
export const messageOf = (e: unknown): string => (e as ApiError)?.data?.message ?? "";

/**
 * Every Pinia store reaches the server through this. On the server it forwards the visitor's cookies
 * (so server-rendered data is theirs); anywhere, a 401 means the session ended, so the auth store
 * signs the user out. Call it at the top of an action, before any `await`, so the request context is available.
 */
export const api = <T>(url: string, opts: Record<string, unknown> = {}): Promise<T> => {
  const request = import.meta.server ? useRequestFetch() : $fetch;
  return (request as typeof $fetch)<T>(url, opts as never).catch((e: unknown) => {
    if (statusOf(e) === 401 && !url.startsWith("/api/auth/")) useAuthStore().expire();
    throw e;
  });
};
