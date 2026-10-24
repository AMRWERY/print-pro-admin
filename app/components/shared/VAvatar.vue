<template>
  <span
    class="grid shrink-0 place-items-center font-mono font-bold"
    :class="[sizeClass[size], shape === 'circle' ? 'rounded-full' : 'rounded-control', toneClass[tone]]"
    aria-hidden="true"
    >{{ initials }}</span
  >
</template>

<script lang="ts" setup>
/**
 * Initials in a circle or rounded square. Decorative: the person's name always sits
 * next to it, so it is hidden from assistive tech.
 */

withDefaults(
  defineProps<{
    initials: string;
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