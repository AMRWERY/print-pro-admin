<template>
  <!-- Native <dialog>: focus trap, Esc to close and inert background come from the browser. -->
  <dialog
    ref="el"
    class="m-auto w-[calc(100%-2rem)] rounded-panel border border-line bg-surface p-0 text-paper shadow-2xl shadow-black/60 backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-rise"
    :class="widthClass"
    :aria-labelledby="titleId"
    @close="open = false"
    @click="onBackdropClick"
  >
    <div v-if="open" class="flex max-h-[85vh] flex-col">
      <header
        class="flex items-start justify-between gap-3 border-b border-line bg-ink px-5 py-3.5"
      >
        <div class="min-w-0">
          <h2 :id="titleId" class="font-display text-lg font-bold">
            {{ title }}
          </h2>
          <p v-if="description" class="mt-0.5 text-xs text-mute">
            {{ description }}
          </p>
        </div>
        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:x"
          aria-label="Close dialog"
          @click="open = false"
        />
      </header>
      <div class="flex-1 overflow-y-auto p-5"><slot /></div>
      <footer
        v-if="$slots.footer"
        class="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-ink px-5 py-3"
      >
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
/**
 * Modal dialog for focused short tasks (design.md §26).
 *
 *   <LazyVDialog v-model:open="show" title="Create requisition" size="lg">
 *     …
 *     <template #footer><LazyVButton>Save</LazyVButton></template>
 *   </LazyVDialog>
 */

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    size?: "md" | "lg" | "xl";
  }>(),
  { size: "md" },
);

const open = defineModel<boolean>("open", { default: false });

const el = ref<HTMLDialogElement | null>(null);
const titleId = useId();

const widthClass = computed(
  () => ({ md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" })[props.size],
);

watch(
  open,
  (isOpen) => {
    const dialog = el.value;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  },
  { flush: "post" },
);

// Opened from the start (e.g. via a query string): the watcher above only sees changes.
onMounted(() => {
  if (open.value && el.value && !el.value.open) el.value.showModal();
});

// A click that lands on the <dialog> itself (not its content) hit the backdrop.
const onBackdropClick = (e: MouseEvent) => {
  if (e.target === el.value) open.value = false;
};
</script>