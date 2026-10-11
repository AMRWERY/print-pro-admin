<template>
  <div v-if="variant === 'text'" class="space-y-2" aria-hidden="true">
    <span
      v-for="n in lines"
      :key="n"
      class="skeleton block h-3 rounded-tight"
      :class="n === lines && lines > 1 ? 'w-3/5' : 'w-full'"
    />
  </div>
  <span v-else class="skeleton block" :class="shapeClass" aria-hidden="true" />
</template>

<script lang="ts" setup>
/**
 * The skeleton primitive every loading layout is built from: a calm block with
 * a sheen sweeping across it (reduced motion: static). Size it with classes.
 *
 *   <LazyVSkeletonLoader class="h-40" />                    block (default)
 *   <LazyVSkeletonLoader variant="line" class="w-2/3" />    single text line
 *   <LazyVSkeletonLoader variant="text" :lines="3" />       paragraph
 *   <LazyVSkeletonLoader variant="circle" class="h-10" />   avatar / dot
 *   <LazyVSkeletonLoader variant="button" class="w-28" />   button
 *
 * Decorative: put aria-busy / aria-label on the container that is loading.
 * Ready-made layouts live in components/skeleton-loaders/.
 */

const props = withDefaults(
  defineProps<{
    variant?: "block" | "line" | "text" | "circle" | "button";
    /** Number of lines for `text`; the last one is shorter. */
    lines?: number;
  }>(),
  { variant: "block", lines: 3 },
);

const shapeClass = computed(
  () =>
    ({
      block: "rounded-card",
      line: "h-3 rounded-tight",
      text: "",
      circle: "aspect-square rounded-full",
      button: "h-10 rounded-control",
    })[props.variant],
);
</script>