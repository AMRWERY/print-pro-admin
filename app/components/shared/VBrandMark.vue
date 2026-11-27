<template>
  <nuxt-link-locale
    to="/"
    class="flex items-center gap-2.5"
    :aria-label="$t('common_ui.brand_home_link')"
  >
    <span
      class="grid h-9 w-9 place-items-center rounded-control bg-accent text-onaccent"
      aria-hidden="true"
    >
      <Icon name="lucide:aperture" size="22" />
    </span>
    <span class="leading-tight" :class="compact && 'hidden min-[400px]:block'">
      <span class="block font-display text-base font-bold tracking-wide"
        ><template v-if="locale === 'ar'">{{ $t("common_ui.brand_name") }}</template
        ><template v-else>Print<span class="text-accent">Pro</span></template></span
      >
      <span class="block meta tracking-widest" :class="compact && 'hidden sm:block'"
        >{{ $t("common_ui.brand_tagline") }}</span
      >
    </span>
  </nuxt-link-locale>
</template>

<script lang="ts" setup>
/** `compact`: on small screens drop the tagline (and, on the narrowest, the name) so the logo can share a row with other controls. */
defineProps<{ compact?: boolean }>();

const { locale } = useI18n();
</script>