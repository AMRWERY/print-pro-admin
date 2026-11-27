<template>
  <header
    class="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur"
  >
    <!-- One row on every screen: menu and logo on the start side, the quick controls on the end side. -->
    <div
      class="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 md:px-6"
    >
      <LazyVButton
        variant="icon"
        icon="lucide:menu"
        class="shrink-0 lg:hidden"
        aria-controls="admin-nav"
        :aria-label="t('common_ui.open_navigation')"
        @click="emit('openNav')"
      />

      <LazyVBrandMark compact class="min-w-0 lg:hidden" />

      <div class="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <p
          class="me-1 hidden items-center gap-1.5 whitespace-nowrap font-mono text-2xs text-success 2xl:flex"
        >
          <span class="status-dot" aria-hidden="true" />
          {{ t("common_ui.system_active") }}
        </p>

        <LazyVThemeToggle />

        <LazyVLocaleSwitcher />

        <div class="sm:ms-1 sm:border-s sm:border-line sm:ps-3">
          <user-menu />
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const { t } = useI18n();

const emit = defineEmits<{ openNav: [] }>();
</script>