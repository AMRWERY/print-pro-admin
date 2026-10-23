// Signed-out visitors can only see the auth pages; everything else sends them to sign-in,
// and a signed-in visitor opening sign-in goes straight to the dashboard.
// The session lives in browser storage, so the app renders client-side only (`ssr: false`).
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore();
  const localePath = useLocalePath();
  const baseName = useRouteBaseName()(to) ?? "";

  if (!auth.isSignedIn) {
    if (baseName === "auth" || baseName.startsWith("auth-")) return;

    // Remember where they were headed (without the locale prefix, which localePath re-adds).
    const target = to.fullPath.replace(/^\/(en|ar)(?=[/?#]|$)/, "") || "/";
    return navigateTo({
      path: localePath("/auth"),
      query: target === "/" ? {} : { redirect: target },
    });
  }

  if (baseName === "auth") return navigateTo(localePath("/"));
});
