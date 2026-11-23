// A product's cover photo for the lists. Fetched with the signed-in session, so it is never public.
export default defineEventHandler(async (event) => {
  const base = String(useRuntimeConfig().apiBase).replace(/\/+$/, "");
  const token = sessionToken(event);
  try {
    const res = await $fetch.raw<ArrayBuffer>(`${base}/api/admin/products/${segment(event, "id")}/cover`, {
      responseType: "arrayBuffer",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });
    setResponseHeaders(event, {
      "content-type": res.headers.get("content-type") ?? "image/jpeg",
      "cache-control": res.headers.get("cache-control") ?? "private, max-age=3600",
    });
    return Buffer.from(res._data as ArrayBuffer);
  } catch {
    throw createError({ statusCode: 404, message: "Not found" });
  }
});
