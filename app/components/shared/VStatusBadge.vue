<template>
  <span
    class="inline-flex items-center gap-1 whitespace-nowrap rounded-tight border px-1.5 py-0.5 font-mono text-2xs font-bold tracking-wider rtl:tracking-normal"
    :class="toneClass[tone]"
  >
    <Icon v-if="icon" :name="icon" size="12" aria-hidden="true" />
    <slot />
  </span>
</template>

<script lang="ts" setup>
import type { Tone } from "~/types/admin/dashboard";

/**
 * Status chip. Colour is never the only signal: pass an icon and always put the
 * status in words in the slot (design.md §22).
 */
withDefaults(defineProps<{ tone?: Tone; icon?: string }>(), {
  tone: "neutral",
});

const toneClass: Record<Tone, string> = {
  success: "border-success/40 bg-success-soft text-success",
  accent: "border-accent/40 bg-accent-soft text-accent",
  warning: "border-yellow/40 bg-yellow-soft text-yellow",
  info: "border-cyan/40 bg-cyan-soft text-cyan",
  neutral: "border-line bg-raised text-mute",
};
</script>
