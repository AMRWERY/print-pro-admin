<template>
  <header
    class="sticky top-0 z-20 border-b border-line bg-ink/85 backdrop-blur"
  >
    <div
      class="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 md:px-6"
    >
      <LazyVButton
        variant="icon"
        icon="lucide:menu"
        class="lg:hidden"
        aria-controls="admin-nav"
        :aria-label="$t('admin.header.open')"
        @click="emit('openNav')"
      />
      <VBrandMark class="lg:hidden" />

      <p
        class="hidden items-center gap-2 font-mono text-xs text-mute xl:flex"
      >
        <span class="chip">ISO-5</span>
        <span class="uppercase">{{ $t("admin.header.path") }}</span>
      </p>

      <form
        role="search"
        class="relative order-last w-full md:order-none md:ms-auto md:w-72 lg:w-80"
        @submit.prevent
      >
        <label for="admin-search" class="sr-only">{{
          $t("admin.header.search")
        }}</label>
        <Icon
          name="lucide:search"
          size="16"
          class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-mute"
          aria-hidden="true"
        />
        <input
          id="admin-search"
          type="search"
          autocomplete="off"
          class="field !ps-9"
          :placeholder="$t('admin.header.searchPlaceholder')"
        />
      </form>

      <div class="ms-auto flex items-center gap-2 md:ms-0">
        <p
          class="me-1 hidden items-center gap-1.5 whitespace-nowrap font-mono text-2xs text-success 2xl:flex"
        >
          <span class="status-dot" aria-hidden="true" />
          {{ $t("admin.header.iso") }}
        </p>
        <VThemeToggle />
        <VLocaleSwitcher />
        <LazyVButton
          variant="icon"
          icon="lucide:bell"
          icon-class="icon-wiggle"
          class="relative"
          :aria-label="$t('admin.header.notifications', { n: unread })"
        >
          <span class="count-badge" aria-hidden="true">{{ unread }}</span>
        </LazyVButton>

        <div
          class="ms-1 flex items-center gap-2.5 border-s border-line ps-3"
        >
          <div class="hidden text-end leading-tight md:block">
            <p class="text-xs font-semibold">{{ $t("admin.header.role") }}</p>
            <p class="font-mono text-2xs text-success">
              {{ $t("admin.header.station") }}
            </p>
          </div>
          <span
            class="grid h-10 w-10 place-items-center rounded-full bg-accent font-mono text-sm font-bold text-onaccent"
            aria-hidden="true"
            >CA</span
          >
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ openNav: [] }>();

const unread = 3;
</script>
