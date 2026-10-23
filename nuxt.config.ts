// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@pinia/nuxt",
    "@vee-validate/nuxt",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "@nuxt/icon",
  ],
  compatibilityDate: "2025-07-15",
  // The session is kept in browser storage, so the server can't know who is signed in.
  // Rendering on the client keeps protected pages from flashing before the auth guard runs.
  ssr: false,
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pinia: {
    storesDirs: ["./stores/**", "./custom-folder/stores/**"],
  },
  i18n: {
    vueI18n: "app/config/i18n/i18n.config.ts",
    restructureDir: "",
    langDir: "app/config/i18n/locales",
    locales: [
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "EN",
        dir: "ltr",
      },
      { code: "ar", iso: "ar-EG", file: "ar.json", name: "ع", dir: "rtl" },
    ],
    defaultLocale: "ar",
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      fallbackLocale: "ar",
      redirectOn: "root",
    },
    bundle: {},
  },
  veeValidate: {
    autoImports: true,
  },
  nitro: {
    // Workaround for nuxt/nuxt#36467 (Windows path separators in Nitro externals)
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/],
    },
  },
  vite: {
    optimizeDeps: {
      // Vite 8's dep scan can't resolve "#components" inside @nuxtjs/i18n
      noDiscovery: true,
      include: ["vue", "vue-router", "pinia", "@vueuse/core", "vee-validate"],
    },
  },
  css: ["~/assets/css/main.css"],
  components: [
    {
      path: "components",
      // path: resolve(layerDir, "components"),
      pathPrefix: false,
    },
  ],
  app: {
    head: {
      title: "PrintPro - Admin",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;700&family=Reem+Kufi:wght@600;700&display=swap",
        },
      ],
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          charset: "utf-8",
        },
      ],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
});
