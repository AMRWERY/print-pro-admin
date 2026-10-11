<template>
  <VPanel
    :title="$t('dashboard.revenue.title')"
    :subtitle="$t('dashboard.revenue.subtitle')"
    icon="lucide:chart-line"
  >
    <template #actions>
      <ul class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-mute">
        <li class="flex items-center gap-1.5">
          <span class="h-0.5 w-4 rounded-full bg-accent" aria-hidden="true" />
          {{ $t("dashboard.revenue.hardware") }}
        </li>
        <li class="flex items-center gap-1.5">
          <span class="h-0.5 w-4 rounded-full bg-yellow" aria-hidden="true" />
          {{ $t("dashboard.revenue.substrates") }}
        </li>
      </ul>
    </template>

    <LazyVSkeletonLoader v-if="loading || !series" class="h-72" />

    <div
      v-else-if="error"
      class="callout-accent"
      role="alert"
    >
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      <div class="space-y-2">
        <p>{{ $t("dashboard.error.revenue") }}</p>
        <LazyVButton size="sm" variant="secondary" icon="lucide:refresh-cw" @click="emit('retry')">{{
          $t("dashboard.error.retry")
        }}</LazyVButton>
      </div>
    </div>

    <div v-else class="space-y-3">
      <!-- The time axis always runs left to right, even in Arabic. -->
      <div
        class="relative rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        dir="ltr"
        tabindex="0"
        role="group"
        :aria-label="$t('dashboard.revenue.chartLabel')"
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
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="rgb(var(--c-accent))" stop-opacity="0.35" />
              <stop offset="1" stop-color="rgb(var(--c-accent))" stop-opacity="0" />
            </linearGradient>
          </defs>

          <g v-for="tick in ticks" :key="tick.y">
            <line
              :x1="PL" :x2="W - PR" :y1="tick.y" :y2="tick.y"
              class="stroke-line" stroke-dasharray="3 4"
            />
            <text :x="PL - 8" :y="tick.y + 3" text-anchor="end" class="fill-mute font-mono" font-size="10">{{ tick.label }}</text>
          </g>

          <text
            v-for="tick in xTicks" :key="tick.i"
            :x="x(tick.i)" :y="H - 8"
            :text-anchor="tick.anchor"
            class="fill-mute font-mono" font-size="10"
          >{{ tick.label }}</text>

          <path :d="areaPath" fill="url(#rev-fill)" />
          <path :d="substratesPath" fill="none" class="stroke-yellow" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
          <path :d="hardwarePath" fill="none" class="stroke-accent" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

          <line :x1="x(active)" :x2="x(active)" :y1="PT" :y2="PT + innerH" class="stroke-paper/40" stroke-dasharray="2 3" />
          <circle :cx="x(active)" :cy="y(series.points[active]!.substrates)" r="3.5" class="fill-yellow stroke-surface" stroke-width="2" />
          <circle :cx="x(active)" :cy="y(series.points[active]!.hardware)" r="4.5" class="fill-accent stroke-surface" stroke-width="2" />
        </svg>

        <div
          class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-card border border-line bg-raised px-2.5 py-1.5 font-mono text-2xs shadow-lg shadow-black/30 transition-[left] duration-fast"
          :style="{ left: `${tooltipLeft}%` }"
        >
          <p class="font-bold text-paper">{{ pointLabel(active) }}</p>
          <p class="text-accent">{{ $t("dashboard.revenue.hardware") }} {{ compactCurrency(series.points[active]!.hardware) }}</p>
          <p class="text-yellow">{{ $t("dashboard.revenue.substrates") }} {{ compactCurrency(series.points[active]!.substrates) }}</p>
        </div>
      </div>

      <p class="sr-only" aria-live="polite">
        {{ pointLabel(active) }}:
        {{ $t("dashboard.revenue.hardware") }} {{ currency(series.points[active]!.hardware, { maximumFractionDigits: 0 }) }},
        {{ $t("dashboard.revenue.substrates") }} {{ currency(series.points[active]!.substrates, { maximumFractionDigits: 0 }) }}.
      </p>

      <dl class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-xs text-mute">
        <div class="flex items-center gap-1.5">
          <dt class="flex items-center gap-1.5"><Icon name="lucide:gauge" size="14" aria-hidden="true" />{{ $t("dashboard.revenue.peak") }}</dt>
          <dd class="font-semibold text-yellow">{{ compactCurrency(series.points[series.peakIndex]!.hardware) }} · {{ pointLabel(series.peakIndex) }}</dd>
        </div>
        <div class="flex items-center gap-1.5">
          <dt>{{ $t("dashboard.revenue.margin") }}</dt>
          <dd class="font-semibold text-paper">{{ percent(series.marginIndex) }} <span class="text-success">({{ signedPercent(series.marginDelta) }} {{ $t("dashboard.revenue.yoy") }})</span></dd>
        </div>
      </dl>
    </div>
  </VPanel>
</template>

<script lang="ts" setup>
import type { RevenueSeries } from "~/types/admin/dashboard";

const props = defineProps<{
  series?: RevenueSeries | null;
  loading?: boolean;
  error?: boolean;
}>();
const emit = defineEmits<{ retry: [] }>();

const { t } = useI18n();
const { currency, compactCurrency, percent, signedPercent } = useFormatters();

const W = 640;
const H = 280;
const PL = 52;
const PR = 12;
const PT = 12;
const PB = 28;
const innerW = W - PL - PR;
const innerH = H - PT - PB;

const count = computed(() => props.series?.points.length ?? 0);

// Round the top of the axis up so the three gridlines land on tidy values.
const yMax = computed(() => {
  const max = Math.max(1, ...(props.series?.points ?? []).map((p) => p.hardware));
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (3 * step)) * 3 * step;
});

const x = (i: number) => PL + (count.value > 1 ? (i * innerW) / (count.value - 1) : 0);
const y = (v: number) => PT + innerH - (v / yMax.value) * innerH;

const toPath = (pick: "hardware" | "substrates") =>
  (props.series?.points ?? [])
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[pick]).toFixed(1)}`)
    .join(" ");

const hardwarePath = computed(() => toPath("hardware"));
const substratesPath = computed(() => toPath("substrates"));
const areaPath = computed(
  () => `${hardwarePath.value} L${x(count.value - 1)},${PT + innerH} L${x(0)},${PT + innerH} Z`,
);

const ticks = computed(() =>
  [0, 1, 2, 3].map((n) => {
    const value = (yMax.value / 3) * n;
    return { y: y(value), label: compactCurrency(value) };
  }),
);

const pointLabel = (i: number) => {
  const unit = props.series?.unit ?? "day";
  return t(`dashboard.revenue.unit.${unit}`, { n: unit === "hour" ? i : i + 1 });
};

const xTicks = computed(() => {
  const last = count.value - 1;
  const indexes = [...new Set([0, 1, 2, 3, 4].map((k) => Math.round((k * last) / 4)))];
  return indexes.map((i) => ({
    i,
    label: pointLabel(i),
    anchor: i === 0 ? "start" : i === last ? "end" : "middle",
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
  if (!rect || count.value < 2) return;
  const vx = ((e.clientX - rect.left) / rect.width) * W;
  const i = Math.round(((vx - PL) / innerW) * (count.value - 1));
  active.value = Math.min(count.value - 1, Math.max(0, i));
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
