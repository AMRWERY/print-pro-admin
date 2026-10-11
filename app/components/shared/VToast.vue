<template>
  <section
    class="pointer-events-none fixed inset-x-4 bottom-20 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:end-4 sm:w-96 lg:bottom-6 lg:end-6"
    aria-label="Notifications"
  >
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex w-full flex-col items-end gap-2"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        :role="t.tone === 'error' ? 'alert' : 'status'"
        :aria-live="t.tone === 'error' ? 'assertive' : 'polite'"
        class="toast-item pointer-events-auto relative w-full overflow-hidden rounded-card border bg-surface shadow-2xl shadow-black/60"
        :class="look[t.tone].border"
        @mouseenter="pause(t.id)"
        @mouseleave="resume(t.id)"
        @focusin="pause(t.id)"
        @focusout="resume(t.id)"
        @keydown.esc="dismiss(t.id)"
      >
        <div class="flex items-start gap-3 px-4 py-3">
          <Icon
            :name="t.icon ?? look[t.tone].icon"
            size="18"
            class="mt-px shrink-0"
            :class="look[t.tone].text"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1 space-y-0.5">
            <p class="font-mono text-xs font-semibold text-paper">
              {{ t.title }}
            </p>
            <p v-if="t.description" class="text-xs text-mute">
              {{ t.description }}
            </p>
            <LazyVButton
              v-if="t.action"
              variant="tertiary"
              size="sm"
              class="!mt-1.5 !text-accent hover:underline"
              :to="t.action.to"
              @click="onAction(t)"
              >{{ t.action.label }}</LazyVButton
            >
          </div>
          <LazyVButton
            variant="plain"
            class="-me-1 -mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-control text-mute transition-colors duration-200 hover:text-paper"
            aria-label="Dismiss notification"
            @click="dismiss(t.id)"
          >
            <Icon name="lucide:x" size="14" aria-hidden="true" />
          </LazyVButton>
        </div>

        <!-- Time left; pauses while hovered or focused -->
        <span
          v-if="t.duration"
          class="toast-bar absolute inset-x-0 bottom-0 h-0.5 motion-reduce:hidden"
          :class="[look[t.tone].bar, paused.has(t.id) && 'toast-paused']"
          :style="{ animationDuration: `${t.duration}ms` }"
          aria-hidden="true"
        />
      </div>
    </TransitionGroup>
  </section>
</template>

<script lang="ts" setup>
/**
 * The toast viewport. Mount once (app.vue) and trigger toasts with `useToast()`.
 * Tones: neutral, success, error, warning, info. Each toast can carry a description and an
 * action, closes itself after its duration (pausing while hovered or focused), and can be
 * dismissed with the X or Esc. Errors are announced assertively, the rest politely.
 */

import type { Toast } from "~/types/shared/VToast";

const { toasts, dismiss } = useToast();

const look = {
  neutral: {
    icon: "lucide:bell",
    text: "text-accent",
    border: "border-line",
    bar: "bg-accent",
  },
  success: {
    icon: "lucide:circle-check",
    text: "text-success",
    border: "border-success/40",
    bar: "bg-success",
  },
  error: {
    icon: "lucide:circle-alert",
    text: "text-accent",
    border: "border-accent/50",
    bar: "bg-accent",
  },
  warning: {
    icon: "lucide:triangle-alert",
    text: "text-yellow",
    border: "border-yellow/40",
    bar: "bg-yellow",
  },
  info: {
    icon: "lucide:info",
    text: "text-cyan",
    border: "border-cyan/40",
    bar: "bg-cyan",
  },
} as const;

// ---- timers: one per toast, paused while the pointer or focus is inside ----
const timers = new Map<
  number,
  { handle: ReturnType<typeof setTimeout>; left: number; at: number }
>();

const paused = reactive(new Set<number>());

const schedule = (id: number, ms: number) => {
  const handle = setTimeout(() => {
    timers.delete(id);
    paused.delete(id);
    dismiss(id);
  }, ms);
  timers.set(id, { handle, left: ms, at: Date.now() });
};

const pause = (id: number) => {
  const t = timers.get(id);
  if (!t || paused.has(id)) return;
  clearTimeout(t.handle);
  t.left -= Date.now() - t.at;
  paused.add(id);
};

const resume = (id: number) => {
  const t = timers.get(id);
  if (!t || !paused.has(id)) return;
  paused.delete(id);
  schedule(id, Math.max(t.left, 800));
};

watch(
  toasts,
  (list) => {
    const live = new Set(list.map((t) => t.id));
    for (const [id, t] of timers) {
      if (!live.has(id)) {
        clearTimeout(t.handle);
        timers.delete(id);
        paused.delete(id);
      }
    }
    for (const t of list)
      if (t.duration && !timers.has(t.id)) schedule(t.id, t.duration);
  },
  { immediate: true, deep: false },
);

onBeforeUnmount(() => timers.forEach((t) => clearTimeout(t.handle)));

const onAction = (t: Toast) => {
  t.action?.onClick?.();
  dismiss(t.id);
};
</script>

<style scoped>
.toast-bar {
  transform-origin: left;
  animation: toast-left linear forwards;
}

[dir="rtl"] .toast-bar {
  transform-origin: right;
}

.toast-paused {
  animation-play-state: paused;
}

@keyframes toast-left {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.25s ease-out,
    opacity 0.25s ease-out;
}

.toast-move {
  transition: transform 0.25s ease-out;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>