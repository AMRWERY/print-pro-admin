<template>
  <div>
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <!-- Slides in from the end edge, like the navigation drawer does from the start. -->
    <aside
      id="notifications-panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      class="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col border-s border-line bg-surface shadow-2xl shadow-black/50 transition-[transform,visibility] duration-normal ease-out"
      :class="open ? 'visible translate-x-0' : 'invisible translate-x-full rtl:-translate-x-full'"
      :inert="open ? undefined : ''"
      @keydown.esc="close"
    >
      <header class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
        <div class="min-w-0">
          <h2 :id="titleId" class="font-display text-lg font-bold">Notifications</h2>
          <p class="meta">{{ unread ? `${unread} unread` : "You are all caught up" }}</p>
        </div>
        <LazyVButton
          ref="closeButton"
          variant="icon"
          size="sm"
          icon="lucide:x"
          aria-label="Close notifications"
          @click="close"
        />
      </header>

      <div class="flex-1 overflow-y-auto p-3">
        <LazyVEmptyState
          v-if="!items.length"
          bare
          icon="lucide:bell-off"
          title="No notifications"
          description="New orders, stock alerts and customer activity will show up here."
        />

        <ul v-else class="space-y-1">
          <li v-for="n in items" :key="n.id">
            <nuxt-link-locale
              :to="n.to"
              class="flex items-start gap-3 rounded-card p-2.5 transition duration-fast hover:bg-raised"
              @click="onOpen(n.id)"
            >
            
            <LazyVIconTile class="mt-0.5" :icon="tone[n.kind].icon" :tone="tone[n.kind].tone" size="sm" />
            
            <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-sm" :class="n.read ? 'font-medium text-mute' : 'font-semibold'">{{ n.title }}</span>
                  <span v-if="!n.read" class="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span v-if="!n.read" class="sr-only">Unread</span>
                </span>
                <span class="block text-xs text-mute">{{ n.body }}</span>
                <span class="meta">{{ n.ago }}</span>
              </span>
            </nuxt-link-locale>
          </li>
        </ul>
      </div>

      <footer v-if="items.length" class="flex shrink-0 items-center justify-between gap-2 border-t border-line px-4 py-3">
        <LazyVButton variant="tertiary" size="sm" @click="clear">Clear all</LazyVButton>
       
        <LazyVButton variant="secondary" size="sm" icon="lucide:check-check" :disabled="!unread" @click="markAllRead">Mark all as read</LazyVButton>
      </footer>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import type { NotificationKind } from "~/composables/useNotifications";
import type { Tone } from "~/types/admin/dashboard";

const { items, unread, open, markRead, markAllRead, clear } = useNotifications();

const titleId = useId();
const route = useRoute();
const closeButton = ref<{ focus: () => void } | null>(null);

const close = () => {
  open.value = false;
};

const tone: Record<NotificationKind, { icon: string; tone: Tone }> = {
  order: { icon: "lucide:receipt-text", tone: "accent" },
  stock: { icon: "lucide:triangle-alert", tone: "warning" },
  customer: { icon: "lucide:user-plus", tone: "info" },
  payment: { icon: "lucide:banknote", tone: "success" },
};

const onOpen = (id: number) => {
  markRead(id);
  close();
};

watch(() => route.fullPath, close);

watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  closeButton.value?.focus();
});

// The page shouldn't scroll underneath the open panel.
const scrollLock = useScrollLock(import.meta.client ? document.body : null);
watch(open, (isOpen) => {
  scrollLock.value = isOpen;
});
</script>