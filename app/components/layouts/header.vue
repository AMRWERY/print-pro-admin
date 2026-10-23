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
        aria-label="Open navigation"
        @click="emit('openNav')"
      />
      
      <LazyVBrandMark class="lg:hidden" />

      <form
        role="search"
        class="relative order-last w-full md:order-none md:ms-auto md:w-72 lg:w-80"
        @submit.prevent
      >
        <label for="admin-search" class="sr-only">Search orders, customers and products</label>
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
          placeholder="Search orders, customers, products…"
        />
      </form>

      <div class="ms-auto flex items-center gap-2 md:ms-0">
        <p
          class="me-1 hidden items-center gap-1.5 whitespace-nowrap font-mono text-2xs text-success 2xl:flex"
        >
          <span class="status-dot" aria-hidden="true" />
          ISO 14644-1 active
        </p>

        <LazyVThemeToggle />

        <LazyVLocaleSwitcher />

        <LazyVButton
          variant="icon"
          icon="lucide:bell"
          icon-class="icon-wiggle"
          class="relative"
          aria-controls="notifications-panel"
          :aria-label="unread ? `Notifications (${unread} unread)` : 'Notifications'"
          @click="notificationsOpen = true"
          :aria-expanded="notificationsOpen"
        >
          <span v-if="unread" class="count-badge" aria-hidden="true">{{ unread }}</span>
        </LazyVButton>

        <div class="ms-1 border-s border-line ps-3">
          <user-menu />
        </div>
      </div>
    </div>

  </header>
</template>

<script lang="ts" setup>
const emit = defineEmits<{ openNav: [] }>();

const { unread, open: notificationsOpen } = useNotifications();
</script>