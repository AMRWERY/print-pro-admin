<template>
  <!-- :localize="false": switchLocalePath() already returns the prefixed path (/ar); adding the locale again would give /en/ar. -->
  <LazyVButton
    v-if="target"
    :to="switchLocalePath(target.code)"
    :localize="false"
    :variant="compact ? 'icon' : 'secondary'"
    :class="!compact && 'h-10 !px-3'"
    :hreflang="target.code"
    :lang="target.code"
    :aria-label="`Switch language to ${target.name}`"
    @click.prevent="switchTo"
  >
    <Icon name="lucide:globe" size="18" class="icon-spin" aria-hidden="true" />
    <span :class="compact && 'sr-only'">{{ target.name }}</span>
  </LazyVButton>
</template>

<script lang="ts" setup>
const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

defineProps<{ compact?: boolean }>();

const { run } = useViewTransition();

// Cross-fade between the two languages (and their text directions).
const switchTo = () => {
  if (!target.value) return;
  const path = switchLocalePath(target.value.code);
  return run(
    async () => {
      await navigateTo(path);
    },
    { kind: "locale" },
  );
};

const target = computed(() =>
  (locales.value as { code: string; name: string }[]).find(
    (l) => l.code !== locale.value,
  ),
);
</script>