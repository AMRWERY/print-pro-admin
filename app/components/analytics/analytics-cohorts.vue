<template>
  <LazyVPanel
    :title="$t('analytics_ui.cohorts_title')"
    :subtitle="$t('analytics_ui.cohorts_subtitle')"
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
          <p class="label-caps">{{ cohortName[c.key] }}</p>
          <p class="font-display text-2xl font-bold tabular-nums">
            {{ c.share }}%
          </p>
          <p class="meta">{{ cohortSub[c.key] }}</p>
          <p class="mt-1 font-mono text-2xs text-success">
            {{ $t('analytics_ui.yoy_change', { value: signedPercent(c.yoy, 0) }) }}
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
              {{ regionName[r.key] }}
              <span class="meta">({{ regionSub[r.key] }})</span>
            </p>
            <p class="meta">{{ $t('analytics_ui.orders_count', { n: number(r.orders) }) }}</p>
          </div>
          <div class="text-end">
            <p class="font-mono text-sm font-semibold tabular-nums">
              {{ currency(r.revenue, { maximumFractionDigits: 0 }) }}
            </p>
            <p class="font-mono text-2xs text-mute">
              {{ percent(r.share) }} {{ $t('analytics_ui.of_total') }}
            </p>
          </div>
          <LazyVMeter
            class="basis-full"
            :value="r.share"
            tone="accent"
            :label="$t('analytics_ui.region_revenue_share', { name: regionName[r.key], value: percent(r.share) })"
          />
        </li>
      </ul>

      <p
        class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-xs text-mute"
      >
        <span>{{ $t('analytics_ui.active_business_accounts', { count: accounts }) }}</span>
        <span class="text-success"
          >{{ $t('analytics_ui.on_time_delivery', { value: percent(onTimePct) }) }}</span
        >
      </p>
    </template>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { Cohort, CohortRow, RegionRow } from "~/types/admin/analytics";

defineProps<{
  cohorts?: CohortRow[] | null;
  regions?: RegionRow[] | null;
  accounts: number;
  onTimePct: number;
  /** The cohort currently filtered to, outlined among the tiles. */
  selected?: Cohort;
}>();

const { t } = useI18n();
const { number, currency, percent, signedPercent } = useFormatters();

const cohortName = computed(() => ({
  enterprise: t("analytics_ui.cohort_enterprise"),
  business: t("analytics_ui.cohort_business"),
  printShop: t("analytics_ui.cohort_print_shop"),
}));
const cohortSub = computed(() => ({
  enterprise: t("analytics_ui.cohort_sub_enterprise"),
  business: t("analytics_ui.cohort_sub_business"),
  printShop: t("customers_ui.segment_print_shop"),
}));
const regionName = computed(() => ({
  cairo: t("analytics_ui.region_cairo"),
  delta: t("analytics_ui.region_delta"),
  gulf: t("analytics_ui.region_gulf"),
  levant: t("analytics_ui.region_levant"),
}));
const regionSub = computed(() => ({
  cairo: t("analytics_ui.region_sub_cairo"),
  delta: t("analytics_ui.region_sub_delta"),
  gulf: t("analytics_ui.region_sub_gulf"),
  levant: t("analytics_ui.region_sub_levant"),
}));
</script>