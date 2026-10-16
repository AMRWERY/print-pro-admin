<template>
  <div ref="root" class="relative" @keydown.esc="close(true)">
    <slot name="trigger" :open="open" :toggle="toggle" :attrs="triggerAttrs" />

    <Transition name="fade">
      <div
        v-if="open"
        :id="menuId"
        ref="menu"
        role="menu"
        :aria-label="label"
        class="absolute z-30 mt-2 overflow-hidden rounded-card border border-line bg-surface shadow-xl shadow-black/40"
        :class="[align === 'end' ? 'end-0' : 'start-0', width]"
        @keydown="onKey"
        @click="onMenuClick"
      >
        <slot name="header" />
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
/**
 * Dropdown menu with the keyboard behaviour a menu needs: arrow keys, Home/End, Esc to
 * close and give focus back, click outside to dismiss. Put `role="menuitem"` on every
 * item (the `menu-item` class styles it); clicking one closes the menu.
 *
 *   <LazyVMenu label="Export">
 *     <template #trigger="{ attrs, toggle }">
 *       <LazyVButton v-bind="attrs" @click="toggle">Export</LazyVButton>
 *     </template>
 *     <button type="button" role="menuitem" class="menu-item w-full" @click="run">CSV</button>
 *   </LazyVMenu>
 */

withDefaults(
  defineProps<{
    label: string;
    align?: "start" | "end";
    /** Tailwind width class for the panel. */
    width?: string;
  }>(),
  { align: "end", width: "w-56" },
);

const menuId = useId();
const root = ref<HTMLElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const open = ref(false);

const items = () =>
  Array.from(
    menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );

const toggle = async () => {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    items()[0]?.focus();
  }
};

const close = (restoreFocus = false) => {
  open.value = false;
  if (restoreFocus)
    root.value?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
};

onClickOutside(root, () => close());

const onMenuClick = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('[role="menuitem"]')) close();
};

const onKey = (e: KeyboardEvent) => {
  const list = items();
  if (!list.length) return;
  const at = list.indexOf(document.activeElement as HTMLElement);
  const next = {
    ArrowDown: (at + 1) % list.length,
    ArrowUp: (at - 1 + list.length) % list.length,
    Home: 0,
    End: list.length - 1,
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  list[next]?.focus();
};

// Spread on the trigger element so it announces the menu correctly.
const triggerAttrs = computed(() => ({
  "aria-haspopup": "menu" as const,
  "aria-expanded": open.value,
  "aria-controls": menuId,
}));
</script>