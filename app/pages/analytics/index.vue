<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('analytics_ui.title')"
      :description="$t('analytics_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('nav.analytics') }]"
    >
      <template #actions>
        <LazyVMenu :label="$t('analytics_ui.filter_cohorts')">
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
                  ? $t('analytics_ui.filter_cohorts')
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

        <LazyVMenu :label="$t('common_ui.export_report')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              :loading="exporting"
              :disabled="!data"
              @click="toggle"
              >{{ $t('common_ui.export_report') }}</LazyVButton
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
          >{{ $t('analytics_ui.sync_ledger') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- Period -->
    <section class="card space-y-3 p-4" aria-label="Reporting period">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <LazyVSegmented
          v-model="filters.range"
          :options="rangeOptions"
          :label="$t('dashboard_ui.reporting_period')"
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
            >{{ dateLabel(data.period.from) }} {{ $t('analytics_ui.period_label_to') }}
            {{ dateLabel(data.period.to) }}</template
          >
          <template v-else>{{ $t('analytics_ui.period_loading') }}</template>
        </span>
        <span v-if="data"
          >vs {{ dateLabel(data.period.prevFrom) }} {{ $t('analytics_ui.period_label_to') }}
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
        <span>{{ $t('analytics_ui.net_of_tax') }}</span>
      </p>
    </section>

    <LazyVErrorBanner
      v-if="error"
      :message="$t('analytics_ui.error_desc')"
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
          :accounts="data?.accounts ?? 0"
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
const { t } = useI18n();

const filters = reactive({
  range: "30d" as AnalyticsRange,
  from: "2026-10-01",
  to: "2026-10-31",
  granularity: "week" as Granularity,
  cohort: "all" as Cohort,
});

// The page renders at once; the cards and charts show their own skeletons.
// Changing any filter fetches again, and the previous numbers stay on screen until the new ones land.
const store = useAnalyticsStore();
const { report: data, pending, error } = storeToRefs(store);
const refresh = () => store.refresh();
watch(() => ({ ...filters }), (q) => store.fetchReport(q), { immediate: true });

const sync = async () => {
  await refresh();
  if (!error.value)
    toast.success(t('analytics_ui.toast_synced'), {
      description: t('analytics_ui.toast_synced_desc'),
    });
};

// --- Export: the chosen period plus the top 25 products for it ---
const exporting = ref(false);

const exportReport = async (format: "pdf" | "excel") => {
  if (!data.value) return;
  exporting.value = true;
  try {
    const top = await store.loadTopForExport({
      range: filters.range,
      from: filters.from,
      to: filters.to,
      perPage: 25,
    });
    await (format === "pdf" ? downloadAnalyticsPdf : downloadAnalyticsExcel)(
      data.value,
      top.rows,
    );
    toast.success(
      format === "pdf" ? t('analytics_ui.toast_export_pdf') : t('analytics_ui.toast_export_excel'),
    );
  } catch {
    toast.error(t('analytics_ui.toast_export_error'), {
      description: t('common_ui.try_again'),
    });
  } finally {
    exporting.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('analytics_ui.seo_title'),
  description: () => t('analytics_ui.seo_description'),
});
</script>