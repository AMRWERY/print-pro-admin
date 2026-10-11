/** Only follow in-site paths after signing in; anything else (https://…, //host) falls back to home. */
export const safeRedirect = (value: unknown, fallback = "/") => {
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") && !v.includes("://") ? v : fallback;
};
