<template>
  <LazyVPanel
    title="Client cohort tiers & geography"
    subtitle="Requisition density by client type and dispatch region"
    icon="lucide:globe"
  >
    <div v-if="!cohorts || !regions" class="space-y-3" aria-busy="true">
      <LazyVSkeletonLoader class="h-24" />
      <LazyVSkeletonLoader v-for="n in 4" :key="n" class="h-12" />
    </div>

    <template v-else>
      <ul class="grid grid-cols-3 gap-2">
        <li
          v-for="c in cohorts"
          :key="c.key"
          class="rounded-card border bg-ink p-3"
          :class="selected === c.key ? 'border-accent' : 'border-line'"
        >
          <p class="label-caps">{{ cohortNote[c.key].name }}</p>
          <p class="font-display text-2xl font-bold tabular-nums">
            {{ c.share }}%
          </p>
          <p class="meta">{{ cohortNote[c.key].sub }}</p>
          <p class="mt-1 font-mono text-2xs text-success">
            {{ signedPercent(c.yoy, 0) }} YoY
          </p>
        </li>
      </ul>

      <ul class="mt-4 space-y-2">
        <li
          v-for="r in regions"
          :key="r.key"
          class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-line bg-ink p-3"
        >
          <Icon
            name="lucide:map-pin"
            size="16"
            class="shrink-0 text-accent"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1 basis-40">
            <p class="text-sm font-medium leading-snug">
              {{ regionLabel[r.key].name }}
              <span class="meta">({{ regionLabel[r.key].sub }})</span>
            </p>
            <p class="meta">{{ number(r.orders) }} requisitions</p>
          </div>
          <div class="text-end">
            <p class="font-mono text-sm font-semibold tabular-nums">
              {{ currency(r.revenue, { maximumFractionDigits: 0 }) }}
            </p>
            <p class="font-mono text-2xs text-mute">
              {{ percent(r.share) }} of total
            </p>
          </div>
          <LazyVMeter
            class="basis-full"
            :value="r.share"
            tone="accent"
            :label="`${regionLabel[r.key].name}: ${percent(r.share)} of revenue`"
          />
        </li>
      </ul>

      <p
        class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-xs text-mute"
      >
        <span>{{ wallets }} active escrow wallets</span>
        <span class="text-success"
          >{{ percent(onTimePct) }} on-time carrier delivery</span
        >
      </p>
    </template>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { cohortNote, regionLabel } from "~/data/analytics-meta";
import type { Cohort, CohortRow, RegionRow } from "~/types/admin/analytics";

defineProps<{
  cohorts?: CohortRow[] | null;
  regions?: RegionRow[] | null;
  wallets: number;
  onTimePct: number;
  /** The cohort currently filtered to, outlined among the tiles. */
  selected?: Cohort;
}>();

const { number, currency, percent, signedPercent } = useFormatters();
</script>