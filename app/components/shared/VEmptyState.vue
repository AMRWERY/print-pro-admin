<template>
  <section
    :class="
      bare
        ? 'flex flex-col items-center justify-center text-center'
        : 'card mx-auto flex w-full max-w-xl flex-col overflow-hidden'
    "
    :aria-labelledby="titleId"
  >
    <header
      v-if="!bare && (eyebrow || tag)"
      class="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-2xs tracking-widest text-mute"
    >
      <span class="truncate">{{ eyebrow }}</span>
      <span
        v-if="tag"
        class="shrink-0 rounded-control px-1.5 py-0.5"
        :class="tagClass[tagTone]"
        >{{ tag }}</span
      >
    </header>

    <div
      class="flex flex-col items-center gap-4 text-center"
      :class="bare ? 'p-8' : 'px-6 py-10 sm:px-10'"
    >
      <slot name="visual">
        <span
          class="relative grid h-24 w-24 place-items-center rounded-panel border border-line bg-raised text-paper"
          aria-hidden="true"
        >
          <span
            class="pointer-events-none absolute inset-2 rounded-card"
          />
          <span
            class="absolute end-0 top-0 h-1.5 w-1.5 rounded-full bg-accent"
          />
          <Icon :name="icon" size="32" class="icon-lift relative" />
          <span
            v-if="caption"
            class="absolute inset-x-0 bottom-2 truncate px-3 font-mono text-3xs text-mute"
            >{{ caption }}</span
          >
        </span>
      </slot>

      <div class="space-y-2">
        <component :is="as" :id="titleId" class="title-md text-balance">{{
          title
        }}</component>
        <p class="mx-auto max-w-sm text-sm text-mute">{{ description }}</p>
      </div>

      <div
        v-if="$slots.default"
        class="mt-2 flex w-full max-w-xs flex-col gap-2 [&>*]:w-full"
      >
        <slot />
      </div>
    </div>

    <footer
      v-if="!bare && meta?.length"
      class="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 font-mono text-2xs tracking-wider text-mute"
    >
      <span v-for="m in meta" :key="m" class="truncate">{{ m }}</span>
    </footer>
  </section>
</template>

<script lang="ts" setup>
/**
 * The one empty state for the whole project: a "manifest" card with an optional
 * header strip, framed icon, headline, explanation, stacked actions and an
 * optional footer strip. Only icon/title/description are needed; the rest adds
 * the technical flavour.
 *
 *   <LazyVEmptyState
 *     icon="lucide:shopping-cart"
 *     title="Your cart is empty"
 *     description="…"
 *     eyebrow="MANIFEST :: CART_NULL"
 *     tag="0 UNITS" tag-tone="accent"
 *     caption="0 UNITS"
 *     :meta="['PAYLOAD: 0.00 KG', 'SPEC: ISO']"
 *   >
 *     <LazyVButton>Primary action</LazyVButton>
 *     <LazyVButton variant="secondary">Secondary action</LazyVButton>
 *   </LazyVEmptyState>
 *
 * `bare` drops the card chrome (for drawers/panels that already provide one).
 * The `visual` slot replaces the icon tile. With no props it shows the catalog
 * "no results" message.
 */

withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    description?: string;
    /** Mono label on the left of the header strip. */
    eyebrow?: string;
    /** Chip on the right of the header strip. */
    tag?: string;
    tagTone?: "neutral" | "accent" | "warning" | "success";
    /** Tiny mono caption inside the icon tile. */
    caption?: string;
    /** Up to two mono readouts for the footer strip. */
    meta?: string[];
    /** No card, header or footer. */
    bare?: boolean;
    /** Heading element. */
    as?: "h1" | "h2" | "h3" | "p";
  }>(),
  {
    icon: "lucide:search-x",
    title: "No instruments match these constraints",
    description:
      "Try removing a filter or widening the price range. Can’t find a specific model? Our bench team can source it.",
    tagTone: "neutral",
    as: "h2",
  },
);

const titleId = useId();

const tagClass = {
  neutral: "border border-line bg-raised text-paper",
  accent: "bg-accent-soft text-accent",
  warning: "bg-yellow-soft text-yellow",
  success: "bg-success-soft text-success",
} as const;
</script>