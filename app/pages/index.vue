<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="t('dashboard_ui.title')"
      :description="t('dashboard_ui.description')"
    >
      <template #actions>
        <LazyVSegmented
          v-model="range"
          :options="rangeOptions"
          :label="t('dashboard_ui.reporting_period')"
        />
      </template>
    </LazyVPageHeader>

    <!-- A failed summary only replaces the sections it feeds, with a way to retry. -->
    <LazyVErrorBanner
      v-if="summaryError"
      :message="t('dashboard_ui.load_error')"
      @retry="() => refreshSummary()"
    />

    <template v-else>
      <!-- Revenue, orders, customers, product count, low-stock alerts, pending orders -->
      <dashboard-kpis :kpis="summary?.kpis" />
    </template>

    <div class="grid gap-4 xl:grid-cols-2">
      <dashboard-chart
        :title="t('dashboard_ui.revenue')"
        :subtitle="t('dashboard_ui.revenue_subtitle')"
        icon="lucide:chart-line"
        kind="line"
        metric="revenue"
        :format="compactCurrency"
        :series="series"
        :loading="seriesPending"
        :error="!!seriesError"
        @retry="() => refreshSeries()"
      />

      <dashboard-chart
        :title="t('dashboard_ui.orders')"
        :subtitle="t('dashboard_ui.orders_subtitle')"
        icon="lucide:receipt-text"
        kind="bar"
        metric="orders"
        :format="number"
        :series="series"
        :loading="seriesPending"
        :error="!!seriesError"
        @retry="() => refreshSeries()"
      />
    </div>

    <template v-if="!summaryError">
      <div class="grid gap-4 xl:grid-cols-2">
        <dashboard-top-products :items="summary?.topProducts" />

        <dashboard-customers :items="summary?.customers" />
      </div>

      <dashboard-orders :data="summary?.orders" />

      <dashboard-low-stock :items="summary?.lowStock" />
    </template>

    <dashboard-quick-actions />
  </div>
</template>

<script lang="ts" setup>
import type {
  DashboardSummary,
  RangeKey,
  RevenueSeries,
} from "~/types/admin/dashboard";

const { t } = useI18n();
const { number, compactCurrency } = useFormatters();

useSeoMeta({
  title: () => t("dashboard_ui.seo_title"),
  description: () => t("dashboard_ui.seo_description"),
});

// The page renders straight away and each section shows its own skeleton.
const store = useDashboardStore();
const { summary, summaryError, series, seriesPending, seriesError } = storeToRefs(store);
const refreshSummary = () => store.refreshSummary();
const refreshSeries = () => store.refreshSeries();
store.fetchSummary();

// One period selector drives both charts.
const range = ref<RangeKey>("month");
watch(range, (r) => store.fetchSeries(r), { immediate: true });

const rangeOptions = computed<{ value: RangeKey; label: string }[]>(() => [
  { value: "today", label: t("dashboard_ui.period_today") },
  { value: "week", label: t("dashboard_ui.period_week") },
  { value: "month", label: t("dashboard_ui.period_month") },
  { value: "quarter", label: t("dashboard_ui.period_quarter") },
  { value: "year", label: t("dashboard_ui.period_year") },
]);

definePageMeta({
  layout: "admin",
});
</script>