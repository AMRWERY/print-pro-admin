// Gives tr() (app/utils/tr.ts) the app's translator, so labels in data files can be translated.
export default defineNuxtPlugin((nuxtApp) => {
  bindI18n(nuxtApp.$i18n as Parameters<typeof bindI18n>[0]);
});
