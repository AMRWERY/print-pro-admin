<template>
  <div class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p class="mt-1 text-sm text-mute">Sales, customers and stock at a glance.</p>
      </div>
      <VSegmented v-model="range" :options="rangeOptions" label="Reporting period" />
    </header>

    <!-- A failed summary only replaces the sections it feeds, with a way to retry. -->
    <div v-if="summaryError" class="callout-accent" role="alert">
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      <div class="space-y-2">
        <p>The dashboard data could not be loaded. Check your connection and try again.</p>
        <LazyVButton size="sm" variant="secondary" icon="lucide:refresh-cw" @click="() => refreshSummary()">Retry</LazyVButton>
      </div>
    </div>

    <template v-else>
      <!-- Revenue, orders, customers, product count, low-stock alerts, pending orders -->
      <DashboardKpis :kpis="summary?.kpis" />
    </template>

    <div class="grid gap-4 xl:grid-cols-2">
      <DashboardChart
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
      <DashboardChart
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
        <DashboardTopProducts :items="summary?.topProducts" />
        <DashboardCustomers :items="summary?.customers" />
      </div>

      <DashboardOrders :data="summary?.orders" />
      <DashboardLowStock :items="summary?.lowStock" />
    </template>

    <DashboardQuickActions />
  </div>
</template>

<script lang="ts" setup>
import type {
  DashboardSummary,
  RangeKey,
  RevenueSeries,
} from "~/types/admin/dashboard";

definePageMeta({ layout: "admin" });

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
</script>
