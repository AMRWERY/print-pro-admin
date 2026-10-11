<template>
  <VPanel
    :title="$t('dashboard.fulfillment.title')"
    :subtitle="$t('dashboard.fulfillment.subtitle', { n: number(data?.total ?? 0) })"
    icon="lucide:truck"
  >
    <div v-if="!data" class="space-y-4" aria-busy="true">
      <LazyVSkeletonLoader variant="circle" class="mx-auto w-40" />
      <LazyVSkeletonLoader variant="text" :lines="4" />
    </div>

    <div v-else class="flex flex-col gap-5">
      <div class="relative mx-auto w-44">
        <svg viewBox="0 0 128 128" class="h-auto w-full -rotate-90" role="img" :aria-label="$t('dashboard.fulfillment.chartLabel', { pct: percent(data.fulfilledPct) })">
          <circle cx="64" cy="64" :r="R" fill="none" class="stroke-raised" stroke-width="14" />
          <circle
            v-for="seg in arcs"
            :key="seg.key"
            cx="64" cy="64" :r="R"
            fill="none"
            stroke-width="14"
            :class="segStroke[seg.key]"
            :stroke-dasharray="`${seg.length} ${C - seg.length}`"
            :stroke-dashoffset="-seg.offset"
          />
        </svg>
        <p class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="font-display text-2xl font-bold tabular-nums">{{ percent(data.fulfilledPct) }}</span>
          <span class="label-caps">{{ $t("dashboard.fulfillment.fulfilled") }}</span>
        </p>
      </div>

      <ul class="space-y-2">
        <li
          v-for="seg in data.segments"
          :key="seg.key"
          class="flex items-center gap-2 text-sm"
        >
          <Icon :name="segIcon[seg.key]" size="14" :class="segText[seg.key]" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate">{{ $t(`dashboard.fulfillment.${seg.key}`) }}</span>
          <span class="font-mono text-xs tabular-nums text-mute">
            {{ number(seg.value) }} · {{ percent((seg.value / data.total) * 100, 0) }}
          </span>
        </li>
      </ul>
    </div>
  </VPanel>
</template>

<script lang="ts" setup>
import type { DashboardSummary } from "~/types/admin/dashboard";

const props = defineProps<{ data?: DashboardSummary["fulfillment"] | null }>();

const { number, percent } = useFormatters();

const R = 52;
const C = 2 * Math.PI * R;
const GAP = 2;

const arcs = computed(() => {
  const total = props.data?.total || 1;
  let offset = 0;
  return (props.data?.segments ?? []).map((seg) => {
    const full = (seg.value / total) * C;
    const arc = { key: seg.key, length: Math.max(0, full - GAP), offset };
    offset += full;
    return arc;
  });
});

// Text, icon and colour all carry the stage, so colour is never the only cue.
const segStroke = {
  delivered: "stroke-success",
  transit: "stroke-accent",
  qa: "stroke-cyan",
  curing: "stroke-mute",
};
const segText = {
  delivered: "text-success",
  transit: "text-accent",
  qa: "text-cyan",
  curing: "text-mute",
};
const segIcon = {
  delivered: "lucide:shield-check",
  transit: "lucide:truck",
  qa: "lucide:microscope",
  curing: "lucide:clock",
};
</script>
