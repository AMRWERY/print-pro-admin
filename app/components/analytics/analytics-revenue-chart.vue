<template>
  <LazyVPanel
    title="Gross revenue vs cash collected"
    subtitle="Current period compared with the previous one, interval by interval"
    icon="lucide:chart-line"
  >
    <template #actions>
      <div role="group" aria-label="Series" class="flex flex-wrap gap-1.5">
        <button
          v-for="s in toggles"
          :key="s.key"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1 font-mono text-xs transition duration-fast"
          :class="
            visible[s.key]
              ? 'border-accent/60 bg-raised text-paper'
              : 'border-line text-mute hover:text-paper'
          "
          :aria-pressed="visible[s.key]"
          @click="visible[s.key] = !visible[s.key]"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="s.dot"
            aria-hidden="true"
          />
          {{ s.label }}
        </button>
      </div>
    </template>

    <LazyVSkeletonLoader v-if="loading || !series" class="h-72" />

    <LazyVErrorBanner
      v-else-if="error"
      message="The revenue chart could not be loaded."
      @retry="emit('retry')"
    />

    <div v-else class="space-y-3">
      <!-- The time axis always runs left to right, even in Arabic. -->
      <div
        class="relative rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        dir="ltr"
        tabindex="0"
        role="group"
        aria-label="Revenue chart. Use the left and right arrow keys to inspect each interval."
        @keydown="onKey"
        @pointerleave="active = peakIndex"
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
              <stop
                offset="0"
                stop-color="rgb(var(--c-accent))"
                stop-opacity="0.3"
              />
              <stop
                offset="1"
                stop-color="rgb(var(--c-accent))"
                stop-opacity="0"
              />
            </linearGradient>
          </defs>

          <g v-for="tick in ticks" :key="tick.y">
            <line
              :x1="PL"
              :x2="W - PR"
              :y1="tick.y"
              :y2="tick.y"
              class="stroke-line"
              stroke-dasharray="3 4"
            />
            <text
              :x="PL - 8"
              :y="tick.y + 3"
              text-anchor="end"
              class="fill-mute font-mono"
              font-size="10"
            >
              {{ tick.label }}
            </text>
          </g>

          <text
            v-for="t in xTicks"
            :key="t.i"
            :x="x(t.i)"
            :y="H - 8"
            :text-anchor="t.anchor"
            class="fill-mute font-mono"
            font-size="10"
          >
            {{ t.label }}
          </text>

          <path
            :d="path('prior')"
            fill="none"
            class="stroke-mute"
            stroke-width="1.5"
            stroke-dasharray="4 4"
            stroke-linejoin="round"
          />
          <template v-if="visible.revenue">
            <path :d="area" :fill="`url(#${fillId})`" />
            <path
              :d="path('revenue')"
              fill="none"
              class="stroke-accent"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </template>
          <path
            v-if="visible.collected"
            :d="path('collected')"
            fill="none"
            class="stroke-yellow"
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            v-if="visible.margin"
            :d="path('margin')"
            fill="none"
            class="stroke-cyan"
            stroke-width="2"
            stroke-linejoin="round"
          />

          <line
            :x1="x(active)"
            :x2="x(active)"
            :y1="PT"
            :y2="PT + innerH"
            class="stroke-paper/40"
            stroke-dasharray="2 3"
          />
          <circle
            v-if="visible.revenue"
            :cx="x(active)"
            :cy="y(series[active]!.revenue)"
            r="4.5"
            class="fill-accent stroke-surface"
            stroke-width="2"
          />
        </svg>

        <div
          class="pointer-events-none absolute top-1 -translate-x-1/2 rounded-card border border-line bg-raised px-2.5 py-1.5 font-mono text-2xs shadow-lg shadow-black/30 transition-[left] duration-fast"
          :style="{ left: `${tooltipLeft}%` }"
        >
          <p class="font-bold text-paper">
            {{ label(active)
            }}<span v-if="active === peakIndex" class="text-yellow">
              · peak</span
            >
          </p>
          <p class="text-accent">
            Revenue {{ compactCurrency(series[active]!.revenue) }}
          </p>
          <p class="text-mute">
            Previous {{ compactCurrency(series[active]!.prior) }}
          </p>
          <p v-if="visible.collected" class="text-yellow">
            Collected {{ compactCurrency(series[active]!.collected) }}
          </p>
          <p v-if="visible.margin" class="text-cyan">
            Margin {{ compactCurrency(series[active]!.margin) }}
          </p>
        </div>
      </div>

      <p class="sr-only" aria-live="polite">
        {{ label(active) }}: revenue
        {{ currency(series[active]!.revenue, { maximumFractionDigits: 0 }) }},
        previous period
        {{ currency(series[active]!.prior, { maximumFractionDigits: 0 }) }}.
      </p>

      <dl
        class="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-xs text-mute"
      >
        <div class="flex items-center gap-2">
          <span class="h-0.5 w-4 rounded-full bg-accent" aria-hidden="true" />
          <dt>Current period</dt>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="h-0 w-4 border-t border-dashed border-mute"
            aria-hidden="true"
          />
          <dt>Previous period</dt>
        </div>
        <div class="flex items-center gap-1.5">
          <dt>Mean throughput</dt>
          <dd class="font-semibold text-paper">
            {{ compactCurrency(meanPerDay) }} / day
          </dd>
        </div>
      </dl>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { pointLabel } from "~/data/analytics-meta";
import type { EffectiveGranularity, TimePoint } from "~/types/admin/analytics";

const props = defineProps<{
  series?: TimePoint[] | null;
  peakIndex: number;
  granularity: EffectiveGranularity;
  days: number;
  loading?: boolean;
  error?: boolean;
}>();

const emit = defineEmits<{ retry: [] }>();

const { currency, compactCurrency } = useFormatters();

const fillId = `analytics-fill-${useId()}`;

const toggles = [
  { key: "revenue", label: "Gross revenue", dot: "bg-accent" },
  { key: "margin", label: "Net margin", dot: "bg-cyan" },
  { key: "collected", label: "Cash collected", dot: "bg-yellow" },
] as const;
const visible = reactive({ revenue: true, margin: false, collected: false });

const W = 760;
const H = 300;
const PL = 56;
const PR = 14;
const PT = 12;
const PB = 28;
const innerW = W - PL - PR;
const innerH = H - PT - PB;

const count = computed(() => props.series?.length ?? 0);

// The axis tops out at the largest value among everything on show, rounded up to tidy gridlines.
const yMax = computed(() => {
  const pts = props.series ?? [];
  const keys = [
    "prior",
    ...toggles.filter((t) => visible[t.key]).map((t) => t.key),
  ] as (keyof TimePoint)[];
  const max = Math.max(
    1,
    ...pts.flatMap((p) => keys.map((k) => p[k] as number)),
  );
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / (3 * step)) * 3 * step;
});

const x = (i: number) =>
  PL + (count.value > 1 ? (i * innerW) / (count.value - 1) : innerW / 2);
const y = (v: number) => PT + innerH - (v / yMax.value) * innerH;

const path = (key: "revenue" | "prior" | "collected" | "margin") =>
  (props.series ?? [])
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`)
    .join(" ");

const area = computed(
  () =>
    `${path("revenue")} L${x(count.value - 1)},${PT + innerH} L${x(0)},${PT + innerH} Z`,
);

const ticks = computed(() =>
  [0, 1, 2, 3].map((n) => ({
    y: y((yMax.value / 3) * n),
    label: compactCurrency((yMax.value / 3) * n),
  })),
);

const label = (i: number) =>
  pointLabel(props.series?.[i]?.at ?? "", props.granularity);

const xTicks = computed(() => {
  const last = count.value - 1;
  const idx = [
    ...new Set([0, 1, 2, 3, 4].map((k) => Math.round((k * last) / 4))),
  ];
  return idx.map((i) => ({
    i,
    label: label(i),
    anchor: i === 0 ? "start" : i === last ? "end" : "middle",
  }));
});

const meanPerDay = computed(
  () =>
    (props.series ?? []).reduce((s, p) => s + p.revenue, 0) /
    Math.max(props.days, 1),
);

const active = ref(0);
watch(
  () => props.series,
  () => (active.value = props.peakIndex),
  { immediate: true },
);

const svg = ref<SVGSVGElement | null>(null);
const onMove = (e: PointerEvent) => {
  const rect = svg.value?.getBoundingClientRect();
  if (!rect || count.value < 2) return;
  const vx = ((e.clientX - rect.left) / rect.width) * W;
  active.value = Math.min(
    count.value - 1,
    Math.max(0, Math.round(((vx - PL) / innerW) * (count.value - 1))),
  );
};

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

const tooltipLeft = computed(() =>
  Math.min(84, Math.max(16, (x(active.value) / W) * 100)),
);
</script>