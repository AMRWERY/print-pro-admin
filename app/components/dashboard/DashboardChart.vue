<template>
  <VPanel :title="title" :subtitle="subtitle" :icon="icon">
    <LazyVSkeletonLoader v-if="loading || (!series && !error)" class="h-64" />

    <div v-else-if="error || !series" class="callout-accent" role="alert">
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      <div class="space-y-2">
        <p>The {{ title.toLowerCase() }} could not be loaded.</p>
        <LazyVButton size="sm" variant="secondary" icon="lucide:refresh-cw" @click="emit('retry')">Retry</LazyVButton>
      </div>
    </div>

    <div v-else class="space-y-3">
      <!-- The time axis always runs left to right, even in Arabic. -->
      <div
        class="relative rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        dir="ltr"
        tabindex="0"
        role="group"
        :aria-label="`${title}. Use the left and right arrow keys to inspect each point.`"
        @keydown="onKey"
        @pointerleave="active = series.peakIndex"
      >
        <svg
          ref="svg"
          :viewBox="`0 0 ${W} ${H}`"
          class="h-auto w-full touch-pan-y select-none"
          aria-hidden="true"
          @pointermove="onMove"
        >
          <defs>
            <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="rgb(var(--c-accent))" stop-opacity="0.35" />
              <stop offset="1" stop-color="rgb(var(--c-accent))" stop-opacity="0" />
            </linearGradient>
          </defs>

          <g v-for="tick in ticks" :key="tick.y">
            <line :x1="PL" :x2="W - PR" :y1="tick.y" :y2="tick.y" class="stroke-line" stroke-dasharray="3 4" />
            <text :x="PL - 8" :y="tick.y + 3" text-anchor="end" class="fill-mute font-mono" font-size="10">{{ tick.label }}</text>
          </g>

          <text
            v-for="tick in xTicks"
            :key="tick.i"
            :x="x(tick.i)"
            :y="H - 8"
            :text-anchor="tick.anchor"
            class="fill-mute font-mono"
            font-size="10"
          >{{ tick.label }}</text>

          <template v-if="kind === 'line'">
            <path :d="areaPath" :fill="`url(#${fillId})`" />
            <path :d="linePath" fill="none" class="stroke-accent" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
            <line :x1="x(active)" :x2="x(active)" :y1="PT" :y2="PT + innerH" class="stroke-paper/40" stroke-dasharray="2 3" />
            <circle :cx="x(active)" :cy="y(valueAt(active))" r="4.5" class="fill-accent stroke-surface" stroke-width="2" />
          </template>

          <template v-else>
            <rect
              v-for="(p, i) in series.points"
              :key="i"
              :x="x(i) - barW / 2"
              :y="y(p[metric])"
              :width="barW"
              :height="PT + innerH - y(p[metric])"
              rx="2"
              :class="i === active ? 'fill-accent' : 'fill-accent/45'"
            />
          </template>
        </svg>

        <div
          class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-card border border-line bg-raised px-2.5 py-1.5 font-mono text-2xs shadow-lg shadow-black/30 transition-[left] duration-fast"
          :style="{ left: `${tooltipLeft}%` }"
        >
          <p class="font-bold text-paper">{{ pointLabel(active) }}</p>
          <p class="text-accent">{{ format(valueAt(active)) }}</p>
        </div>
      </div>

      <p class="sr-only" aria-live="polite">{{ pointLabel(active) }}: {{ format(valueAt(active)) }}.</p>

      <p class="flex items-center gap-1.5 border-t border-line pt-3 font-mono text-xs text-mute">
        <Icon name="lucide:gauge" size="14" aria-hidden="true" />
        Peak
        <span class="font-semibold text-paper">{{ format(valueAt(series.peakIndex)) }} · {{ pointLabel(series.peakIndex) }}</span>
      </p>
    </div>
  </VPanel>
</template>

<script lang="ts" setup>
import type { RevenueSeries } from "~/types/admin/dashboard";

/**
 * One chart component for both dashboard charts: `kind="line"` for revenue,
 * `kind="bar"` for orders. Hover, touch or arrow keys inspect each point.
 */
const props = defineProps<{
  title: string;
  subtitle?: string;
  icon?: string;
  kind: "line" | "bar";
  metric: "revenue" | "orders";
  /** Formats a value for the axis and tooltip. */
  format: (value: number) => string;
  series?: RevenueSeries | null;
  loading?: boolean;
  error?: boolean;
}>();
const emit = defineEmits<{ retry: [] }>();

const fillId = `chart-fill-${useId()}`;

const W = 640;
const H = 260;
const PL = 52;
const PR = 12;
const PT = 12;
const PB = 28;
const innerW = W - PL - PR;
const innerH = H - PT - PB;

const count = computed(() => props.series?.points.length ?? 0);
const valueAt = (i: number) => props.series?.points[i]?.[props.metric] ?? 0;

// Round the top of the axis up so the three gridlines land on tidy values.
const yMax = computed(() => {
  const max = Math.max(1, ...(props.series?.points ?? []).map((p) => p[props.metric]));
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (3 * step)) * 3 * step;
});

const slot = computed(() => innerW / Math.max(count.value, 1));
const barW = computed(() => Math.min(28, slot.value * 0.6));

// Lines run edge to edge; bars sit in the middle of their slot.
const x = (i: number) =>
  props.kind === "bar"
    ? PL + (i + 0.5) * slot.value
    : PL + (count.value > 1 ? (i * innerW) / (count.value - 1) : 0);
const y = (v: number) => PT + innerH - (v / yMax.value) * innerH;

const linePath = computed(() =>
  Array.from({ length: count.value }, (_, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(valueAt(i)).toFixed(1)}`).join(" "),
);
const areaPath = computed(
  () => `${linePath.value} L${x(count.value - 1)},${PT + innerH} L${x(0)},${PT + innerH} Z`,
);

const ticks = computed(() =>
  [0, 1, 2, 3].map((n) => {
    const value = (yMax.value / 3) * n;
    return { y: y(value), label: props.format(value) };
  }),
);

const unitNames = { day: "Day", week: "Week", month: "Month" } as const;

const pointLabel = (i: number) => {
  const unit = props.series?.unit ?? "day";
  const n = unit === "hour" ? i : i + 1;
  return unit === "hour" ? `${n}:00` : `${unitNames[unit]} ${n}`;
};

const xTicks = computed(() => {
  const last = count.value - 1;
  const indexes = [...new Set([0, 1, 2, 3, 4].map((k) => Math.round((k * last) / 4)))];
  return indexes.map((i) => ({
    i,
    label: pointLabel(i),
    anchor: props.kind === "bar" ? "middle" : i === 0 ? "start" : i === last ? "end" : "middle",
  }));
});

const active = ref(0);
watch(
  () => props.series,
  (s) => {
    active.value = s?.peakIndex ?? 0;
  },
  { immediate: true },
);

const svg = ref<SVGSVGElement | null>(null);

const onMove = (e: PointerEvent) => {
  const rect = svg.value?.getBoundingClientRect();
  if (!rect || count.value < 1) return;
  const vx = ((e.clientX - rect.left) / rect.width) * W;
  const raw =
    props.kind === "bar"
      ? Math.floor((vx - PL) / slot.value)
      : Math.round(((vx - PL) / innerW) * (count.value - 1));
  active.value = Math.min(count.value - 1, Math.max(0, raw));
};

// Arrow keys step through the points (the chart is always left-to-right).
const onKey = (e: KeyboardEvent) => {
  const last = count.value - 1;
  const next = {
    ArrowLeft: active.value - 1,
    ArrowRight: active.value + 1,
    Home: 0,
    End: last,
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  active.value = Math.min(last, Math.max(0, next));
};

const tooltipLeft = computed(() => Math.min(86, Math.max(14, (x(active.value) / W) * 100)));
</script>
