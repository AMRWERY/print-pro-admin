<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Dashboard"
      description="Sales, customers and stock at a glance."
    >
      <template #actions>
        <LazyVSegmented
          v-model="range"
          :options="rangeOptions"
          label="Reporting period"
        />
      </template>
    </LazyVPageHeader>

    <!-- A failed summary only replaces the sections it feeds, with a way to retry. -->
    <LazyVErrorBanner
      v-if="summaryError"
      message="The dashboard data could not be loaded. Check your connection and try again."
      @retry="() => refreshSummary()"
    />

    <template v-else>
      <!-- Revenue, orders, customers, product count, low-stock alerts, pending orders -->
      <dashboard-kpis :kpis="summary?.kpis" />
    </template>

    <div class="grid gap-4 xl:grid-cols-2">
      <dashboard-chart
        title="Revenue"
        subtitle="Gross sales over the selected period"
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
        title="Orders"
        subtitle="Orders placed over the selected period"
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

const { number, compactCurrency } = useFormatters();

useSeoMeta({
  title: "PrintPro — Dashboard",
  description:
    "Revenue, orders, customers, best-selling products and inventory alerts at a glance.",
});

// lazy: the page renders straight away and each section shows its own skeleton.
const {
  data: summary,
  error: summaryError,
  refresh: refreshSummary,
} = useFetch<DashboardSummary>("/api/admin/dashboard", { lazy: true });

// One period selector drives both charts.
const range = ref<RangeKey>("month");
const {
  data: series,
  pending: seriesPending,
  error: seriesError,
  refresh: refreshSeries,
} = useFetch<RevenueSeries>("/api/admin/revenue", {
  lazy: true,
  query: { range },
});

const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "PrintPro",
  description:
    "Sales, orders and stock for printers, photocopiers, ink and toner.",
});
</script>