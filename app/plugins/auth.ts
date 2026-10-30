// Finds out who is signed in before the first page renders, so the route guard can read it
// synchronously. When the session ends later (a request came back 401) the user is sent to sign-in.
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  await auth.ensureLoaded();

  const router = useRouter();
  const localePath = useLocalePath();
  watch(
    () => auth.isSignedIn,
    (signedIn, wasSignedIn) => {
      if (signedIn || !wasSignedIn) return;
      // Same convention as middleware/auth.global.ts: the path without its locale prefix.
      const current = router.currentRoute.value;
      if (String(current.name ?? "").startsWith("auth")) return;
      const target = current.fullPath.replace(/^\/(en|ar)(?=[/?#]|$)/, "") || "/";
      navigateTo({ path: localePath("/auth"), query: target === "/" ? {} : { redirect: target } });
    },
  );
});
