<template>
  <div
    class="h-1.5 w-full overflow-hidden rounded-full bg-raised"
    role="meter"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="clamped"
  >
    <div
      class="h-full rounded-full transition-[width] duration-large ease-out"
      :class="barClass[tone]"
      :style="{ width: `${clamped}%` }"
    />
  </div>
</template>

<script lang="ts" setup>
import type { Tone } from "~/types/admin/dashboard";

const props = withDefaults(
  defineProps<{ value: number; label: string; tone?: Tone }>(),
  { tone: "accent" },
);

const clamped = computed(() =>
  Math.round(Math.min(100, Math.max(0, props.value)) * 10) / 10,
);

const barClass: Record<Tone, string> = {
  success: "bg-success",
  accent: "bg-accent",
  warning: "bg-yellow",
  info: "bg-cyan",
  neutral: "bg-mute",
};
</script>
