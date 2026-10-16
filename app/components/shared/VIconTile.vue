<template>
  <span
    class="grid shrink-0 place-items-center rounded-control border"
    :class="[sizeClass[size], toneClass[tone]]"
    aria-hidden="true"
  >
    <Icon :name="icon" :size="size === 'sm' ? 16 : 18" />
  </span>
</template>

<script lang="ts" setup>
import type { Tone } from "~/types/admin/dashboard";

/** A framed icon for list rows (product, notification kind…). Decorative. */
withDefaults(defineProps<{ icon: string; tone?: Tone; size?: "sm" | "md" }>(), {
  tone: "neutral",
  size: "md",
});

const sizeClass = { sm: "h-9 w-9", md: "h-10 w-10" };

const toneClass: Record<Tone, string> = {
  neutral: "border-line bg-raised text-accent",
  accent: "border-accent/40 bg-accent-soft text-accent",
  warning: "border-yellow/40 bg-yellow-soft text-yellow",
  info: "border-cyan/40 bg-cyan-soft text-cyan",
  success: "border-success/40 bg-success-soft text-success",
};
</script>