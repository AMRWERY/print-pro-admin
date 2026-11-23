<template>
  <span
    class="relative grid shrink-0 place-items-center overflow-hidden font-mono font-bold"
    :class="[sizeClass[size], shape === 'circle' ? 'rounded-full' : 'rounded-control', toneClass[tone]]"
    aria-hidden="true"
  >
    <img v-if="src" :src="src" alt="" class="absolute inset-0 h-full w-full object-cover" />
    <template v-else>{{ initials }}</template>
  </span>
</template>

<script lang="ts" setup>
/**
 * A photo, or the initials when there is none, in a circle or rounded square. Decorative: the person's name always sits
 * next to it, so it is hidden from assistive tech.
 */

withDefaults(
  defineProps<{
    initials: string;
    /** A photo; shown instead of the initials when there is one. */
    src?: string;
    size?: "sm" | "md";
    shape?: "circle" | "square";
    tone?: "neutral" | "accent";
  }>(),
  { size: "md", shape: "circle", tone: "neutral" },
);

const sizeClass = { sm: "h-8 w-8 text-2xs", md: "h-10 w-10 text-xs" };

const toneClass = {
  neutral: "border border-line bg-raised",
  accent: "bg-accent text-onaccent",
};
</script>