<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Commercial Telemetry & Yield Analytics"
      description="Econometric reporting on hardware acquisitions, substrate consumption and institutional requisitions."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Analytics' }]"
    >
      <template #actions>
        <LazyVMenu label="Filter cohorts">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:sliders-horizontal"
              icon-end="lucide:chevron-down"
              @click="toggle"
            >
              {{
                filters.cohort === "all"
                  ? "Filter cohorts"
                  : cohortLabel[filters.cohort]
              }}
            </LazyVButton>
          </template>
          <button
            v-for="(label, key) in cohortLabel"
            :key="key"
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="filters.cohort = key"
          >
            <Icon
              :name="filters.cohort === key ? 'lucide:check' : 'lucide:dot'"
              size="16"
              aria-hidden="true"
            />
            {{ label }}
          </button>
        </LazyVMenu>

        <LazyVMenu label="Export report">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :loading="exporting"
              :disabled="!data"
              @click="toggle"
              >Export report</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportReport('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportReport('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel
          </button>
        </LazyVMenu>

        <LazyVButton icon="lucide:refresh-cw" :loading="pending" @click="sync"
          >Sync ledger</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- Period -->
    <section class="card space-y-3 p-4" aria-label="Reporting period">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <LazyVSegmented
          v-model="filters.range"
          :options="rangeOptions"
          label="Reporting period"
        />
        <LazyVSegmented
          v-model="filters.granularity"
          :options="granularityOptions"
          label="Chart interval"
        />
      </div>

      <div
        v-if="filters.range === 'custom'"
        class="grid gap-3 sm:grid-cols-2 lg:max-w-xl"
      >
        <LazyVDatePicker
          v-model="filters.from"
          name="analyticsFrom"
          label="From"
          :max="filters.to"
          :shortcuts="false"
        />
        <LazyVDatePicker
          v-model="filters.to"
          name="analyticsTo"
          label="To"
          :min="filters.from"
          :shortcuts="false"
        />
      </div>

      <p
        class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-mute"
        aria-live="polite"
      >
        <span class="flex items-center gap-1.5 text-paper">
          <Icon name="lucide:calendar-range" size="14" aria-hidden="true" />
          <template v-if="data"
            >{{ dateLabel(data.period.from) }} to
            {{ dateLabel(data.period.to) }}</template
          >
          <template v-else>Loading period…</template>
        </span>
        <span v-if="data"
          >vs {{ dateLabel(data.period.prevFrom) }} to
          {{ dateLabel(data.period.prevTo) }}</span
        >
        <span
          v-if="
            data &&
            data.granularity !== filters.granularity &&
            data.granularity !== 'hour'
          "
          class="text-yellow"
          >Shown {{ data.granularity === "week" ? "weekly" : "monthly" }}: too
          many points for
          {{ filters.granularity === "day" ? "daily" : "weekly" }}</span
        >
        <span>Net of tax</span>
      </p>
    </section>

    <LazyVErrorBanner
      v-if="error"
      message="The analytics could not be loaded. Check your connection and try again."
      @retry="() => refresh()"
    />

    <template v-else>
      <analytics-kpis :kpis="data?.kpis" />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <analytics-revenue-chart
          :series="data?.series"
          :peak-index="data?.peakIndex ?? 0"
          :granularity="data?.granularity ?? 'day'"
          :days="data?.period.days ?? 1"
          :loading="pending && !data"
        />
        <analytics-funnel :funnel="data?.funnel" />
      </div>

      <div class="grid gap-4 xl:grid-cols-2">
        <analytics-categories
          :categories="data?.categories"
          :portfolio-margin="data?.portfolioMargin ?? 0"
        />
        <analytics-cohorts
          :cohorts="data?.cohorts"
          :regions="data?.regions"
          :wallets="data?.wallets ?? 0"
          :on-time-pct="data?.onTimePct ?? 0"
          :selected="filters.cohort"
        />
      </div>
    </template>

    <analytics-products-table
      :period="{ range: filters.range, from: filters.from, to: filters.to }"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  cohortLabel,
  dateLabel,
  granularityOptions,
  rangeOptions,
} from "~/data/analytics-meta";
import type {
  AnalyticsRange,
  AnalyticsResponse,
  Cohort,
  Granularity,
  TopProductsResponse,
} from "~/types/admin/analytics";

const toast = useToast();

const filters = reactive({
  range: "30d" as AnalyticsRange,
  from: "2026-10-01",
  to: "2026-10-31",
  granularity: "week" as Granularity,
  cohort: "all" as Cohort,
});

// lazy: the page renders at once; the cards and charts show their own skeletons.
// Changing any filter fetches again, and the previous numbers stay on screen until the new ones land.
const { data, pending, error, refresh } = useFetch<AnalyticsResponse>(
  "/api/admin/analytics",
  {
    lazy: true,
    query: computed(() => ({ ...filters })),
  },
);

const sync = async () => {
  await refresh();
  if (!error.value)
    toast.success("Ledger synced", {
      description: "The figures are up to date.",
    });
};

// --- Export: the chosen period plus the top 25 products for it ---
const exporting = ref(false);

const exportReport = async (format: "pdf" | "excel") => {
  if (!data.value) return;
  exporting.value = true;
  try {
    const top = await $fetch<TopProductsResponse>(
      "/api/admin/analytics/top-products",
      {
        query: {
          range: filters.range,
          from: filters.from,
          to: filters.to,
          perPage: 25,
        },
      },
    );
    await (format === "pdf" ? downloadAnalyticsPdf : downloadAnalyticsExcel)(
      data.value,
      top.rows,
    );
    toast.success(
      format === "pdf" ? "PDF report downloaded" : "Excel report downloaded",
    );
  } catch {
    toast.error("Couldn't create the report", {
      description: "Try again in a moment.",
    });
  } finally {
    exporting.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Analytics",
  description:
    "Revenue, conversion, category margin and stock velocity for the chosen period.",
});
</script>