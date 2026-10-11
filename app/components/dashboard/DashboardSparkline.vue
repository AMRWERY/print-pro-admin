<template>
  <svg
    viewBox="0 0 100 32"
    preserveAspectRatio="none"
    class="h-10 w-full overflow-visible"
    aria-hidden="true"
    dir="ltr"
  >
    <path :d="area" class="fill-accent/15" />
    <path
      :d="line"
      fill="none"
      class="stroke-accent"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps<{ values: number[] }>();

const coords = computed(() => {
  const min = Math.min(...props.values);
  const span = Math.max(...props.values) - min || 1;
  const step = props.values.length > 1 ? 100 / (props.values.length - 1) : 0;
  return props.values.map((v, i) => [i * step, 30 - ((v - min) / span) * 28] as const);
});

const line = computed(() =>
  coords.value.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" "),
);
const area = computed(() => `${line.value} L100,32 L0,32 Z`);
</script>
