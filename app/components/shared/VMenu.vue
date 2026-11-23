<template>
  <div ref="root" class="relative" @keydown.esc="close(true)">
    <slot name="trigger" :open="open" :toggle="toggle" :attrs="triggerAttrs" />

    <!-- Rendered on the page itself (not inside the row), so a table or card that scrolls or clips can never cut it off. -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="open"
          :id="menuId"
          ref="menu"
          role="menu"
          :aria-label="label"
          class="fixed z-50 overflow-hidden rounded-card border border-line bg-surface shadow-xl shadow-black/40"
          :class="width"
          :style="position"
          @keydown.esc="close(true)"
          @keydown="onKey"
          @click="onMenuClick"
        >
          <slot name="header" />
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
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

const props = withDefaults(
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
const position = ref<Record<string, string>>({ top: "0px", left: "0px", visibility: "hidden" });

/** Puts the panel next to its button: below it, or above it when there is more room there. Kept inside the screen. */
const place = () => {
  const trigger = root.value;
  const panel = menu.value;
  if (!trigger || !panel) return;
  const r = trigger.getBoundingClientRect();
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const gap = 8;
  const margin = 8;
  const rtl = document.documentElement.dir === "rtl";
  // "end" lines up with the far edge of the button in the reading direction.
  const alignRight = (props.align === "end") !== rtl;
  let left = alignRight ? r.right - w : r.left;
  left = Math.min(Math.max(margin, left), window.innerWidth - w - margin);
  const below = window.innerHeight - r.bottom - gap - margin;
  const above = r.top - gap - margin;
  const top = h > below && above > below ? Math.max(margin, r.top - gap - h) : r.bottom + gap;
  position.value = { top: `${top}px`, left: `${left}px` };
};

const items = () =>
  Array.from(
    menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );

const toggle = async () => {
  open.value = !open.value;
  if (open.value) {
    // Hidden until it has been measured and placed, so it never flashes in the wrong spot.
    position.value = { top: "0px", left: "0px", visibility: "hidden" };
    await nextTick();
    place();
    items()[0]?.focus();
  }
};

const close = (restoreFocus = false) => {
  open.value = false;
  if (restoreFocus)
    root.value?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
};

onClickOutside(root, () => close(), { ignore: [menu] });

// Follow the button when the page or a scrolling table moves, and when the window changes size.
useEventListener(window, "resize", () => open.value && place());
useEventListener(window, "scroll", () => open.value && place(), { capture: true, passive: true });

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