// The URL prefix (/en, /ar) is the source of truth for the locale, and app.vue
// derives lang/dir from it. This plugin only mirrors the active locale into
// the store so stored state never overrides the route.
export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as any;
  const localeStore = useLocaleStore();

  watch(
    () => i18n.locale.value,
    (current) => {
      if (current === "en" || current === "ar") localeStore.locale = current;
    },
    { immediate: true },
  );
});
