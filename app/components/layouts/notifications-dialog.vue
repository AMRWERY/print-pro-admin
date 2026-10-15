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
            <NuxtLinkLocale
              :to="n.to"
              class="flex items-start gap-3 rounded-card p-2.5 transition duration-fast hover:bg-raised"
              @click="onOpen(n.id)"
            >
              <span
                class="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-control border"
                :class="tone[n.kind].box"
                aria-hidden="true"
              >
                <Icon :name="tone[n.kind].icon" size="16" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-sm" :class="n.read ? 'font-medium text-mute' : 'font-semibold'">{{ n.title }}</span>
                  <span v-if="!n.read" class="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <span v-if="!n.read" class="sr-only">Unread</span>
                </span>
                <span class="block text-xs text-mute">{{ n.body }}</span>
                <span class="meta">{{ n.ago }}</span>
              </span>
            </NuxtLinkLocale>
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

const { items, unread, open, markRead, markAllRead, clear } = useNotifications();

const titleId = useId();
const route = useRoute();
const closeButton = ref<{ focus: () => void } | null>(null);

const close = () => {
  open.value = false;
};

const tone: Record<NotificationKind, { icon: string; box: string }> = {
  order: { icon: "lucide:receipt-text", box: "border-accent/40 bg-accent-soft text-accent" },
  stock: { icon: "lucide:triangle-alert", box: "border-yellow/40 bg-yellow-soft text-yellow" },
  customer: { icon: "lucide:user-plus", box: "border-cyan/40 bg-cyan-soft text-cyan" },
  payment: { icon: "lucide:banknote", box: "border-success/40 bg-success-soft text-success" },
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
