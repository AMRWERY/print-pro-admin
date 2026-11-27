<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <VToast />
  </div>
</template>

<script lang="ts" setup>
const { locale, t } = useI18n();
const { theme } = useTheme();

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => (locale.value === "ar" ? "rtl" : "ltr")),
    "data-theme": computed(() => theme.value),
  },
});

useSeoMeta({
  title: () => t("common_ui.brand_home"),
  ogTitle: () => t("common_ui.brand_name"),
  description: () => t("common_ui.site_description"),
  ogDescription: () => t("common_ui.site_description"),
  // ogImage: 'https://example.com/image.png',
  // twitterCard: 'summary_large_image',
})
</script>
