<template>
  <div class="space-y-5">
    <!-- Title block -->
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div class="min-w-0 space-y-2">
        <p class="eyebrow-accent">
          <span class="pip" aria-hidden="true" />
          {{ $t("dashboard.eyebrow") }}
        </p>
        <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl xl:text-4xl">
          {{ $t("dashboard.title") }}
        </h1>
        <p class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-mute">
          <span class="chip" dir="ltr">SYS/METROLOGY-V2.4</span>
          <span class="flex items-center gap-1.5 text-success">
            <span class="status-dot" aria-hidden="true" />
            {{ $t("dashboard.nodes", { sla: percent(99.98, 2) }) }}
          </span>
          <span><DashboardClock /> · {{ $t("dashboard.locked") }}</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <DashboardAlerts
          v-if="summary"
          :escrow-backlog="summary.alerts.escrowBacklog"
          :low-stock="summary.alerts.lowStock"
          variant="counters"
          class="hidden xl:flex"
        />
        <LazyVButton icon="lucide:download" icon-class="icon-lift" @click="exportLedger">{{
          $t("dashboard.export")
        }}</LazyVButton>
      </div>
    </div>

    <!-- A failed summary only replaces the sections it feeds, with a way to retry. -->
    <div v-if="summaryError" class="callout-accent" role="alert">
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      <div class="space-y-2">
        <p>{{ $t("dashboard.error.summary") }}</p>
        <LazyVButton size="sm" variant="secondary" icon="lucide:refresh-cw" @click="() => refreshSummary()">{{
          $t("dashboard.error.retry")
        }}</LazyVButton>
      </div>
    </div>

    <template v-else>
      <!-- Tablet / mobile alert strips (wide screens show counters in the title block) -->
      <DashboardAlerts
        v-if="summary"
        class="xl:hidden"
        :escrow-backlog="summary.alerts.escrowBacklog"
        :low-stock="summary.alerts.lowStock"
      />

      <DashboardKpis :kpis="summary?.kpis" />

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="space-y-3">
          <div class="flex justify-end">
            <VSegmented v-model="range" :options="rangeOptions" :label="$t('dashboard.range.label')" />
          </div>
          <DashboardRevenueChart
            :series="revenue"
            :loading="revenuePending"
            :error="!!revenueError"
            @retry="() => refreshRevenue()"
          />
        </div>
        <div class="lg:pt-[3.25rem]">
          <DashboardFulfillment :data="summary?.fulfillment" class="h-full" />
        </div>
      </div>

      <DashboardLowStock :items="summary?.lowStock" />

      <div class="grid gap-4 xl:grid-cols-12">
        <DashboardTopProducts
          :items="summary?.topProducts"
          :share="summary?.topShare ?? 0"
          class="xl:col-span-12"
        />
        <DashboardOrders :data="summary?.orders" class="xl:order-1 xl:col-span-8" />
        <DashboardStudios :items="summary?.studios" class="xl:order-2 xl:col-span-4" />
      </div>

      <DashboardQuickActions />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type {
  DashboardSummary,
  RangeKey,
  RevenueSeries,
} from "~/types/admin/dashboard";

definePageMeta({ layout: "admin" });

const { t } = useI18n();
const { percent } = useFormatters();

useSeoMeta({
  title: "PrintPro — Executive Operations Bench",
  description:
    "Gross escrow, requisitions, atelier accounts and depot stock for the cleanroom lab, at a glance.",
});

// lazy: the page renders straight away and each section shows its own skeleton.
const {
  data: summary,
  error: summaryError,
  refresh: refreshSummary,
} = useFetch<DashboardSummary>("/api/admin/dashboard", { lazy: true });

const range = ref<RangeKey>("month");
const {
  data: revenue,
  pending: revenuePending,
  error: revenueError,
  refresh: refreshRevenue,
} = useFetch<RevenueSeries>("/api/admin/revenue", {
  lazy: true,
  query: { range },
});

const rangeOptions = computed(() =>
  (["today", "week", "month", "quarter", "year"] as const).map((value) => ({
    value,
    label: t(`dashboard.range.${value}`),
  })),
);

// Downloads the requisitions currently on the bench as a CSV ledger.
const exportLedger = () => {
  const rows = summary.value?.orders.rows;
  if (!rows?.length) return;
  const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const csv = [
    ["id", "client", "location", "allocation", "escrow_eur", "status"],
    ...rows.map((r) => [r.id, r.client, r.location, r.allocation, r.amount, r.status]),
  ]
    .map((line) => line.map(cell).join(","))
    .join("\r\n");

  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: "requisitions-ledger.csv",
  });
  link.click();
  URL.revokeObjectURL(url);
};
</script>
