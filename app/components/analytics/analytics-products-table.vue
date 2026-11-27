<template>
  <LazyVPanel
    :title="$t('analytics_ui.products_table_title')"
    :subtitle="$t('analytics_ui.products_table_subtitle')"
    icon="lucide:package"
    body-class=""
  >
    <template #actions>
      <div class="flex flex-wrap items-center gap-2">
        <form role="search" class="w-44" @submit.prevent>
          <LazyVInput
            v-model="q"
            name="analyticsSku"
            type="search"
            :label="$t('analytics_ui.filter_skus')"
            hide-label
            icon="lucide:search"
            autocomplete="off"
            :placeholder="$t('analytics_ui.filter_sku_placeholder')"
          />
        </form>
        <LazyVSelectInput
          v-model="category"
          name="analyticsCategory"
          :label="$t('analytics_ui.division')"
          hide-label
          :options="categories.options(true)"
          class="w-44"
        />
      </div>
    </template>

    <div v-if="error" class="p-4 sm:p-5">
      <LazyVErrorBanner
        :message="$t('analytics_ui.ranking_error')"
        @retry="() => refresh()"
      />
    </div>

    <div v-else-if="!pending && data && !data.rows.length" class="p-4 sm:p-5">
      <LazyVEmptyState
        bare
        icon="lucide:search-x"
        :title="$t('analytics_ui.no_matching_skus')"
        :description="$t('analytics_ui.no_matching_skus_desc')"
      >
        <LazyVButton variant="secondary" @click="reset"
          >{{ $t('common_ui.clear_filters') }}</LazyVButton
        >
      </LazyVEmptyState>
    </div>

    <template v-else>
      <!-- Wide screens: table -->
      <div class="hidden xl:block">
        <table class="w-full text-sm" :aria-busy="pending || undefined">
          <caption class="sr-only">
            {{ $t('dashboard_ui.best_selling_products') }}
          </caption>
          <thead>
            <tr class="border-y border-line bg-ink">
              <th
                scope="col"
                class="label-caps px-4 py-3 text-start font-normal"
              >
                {{ $t('analytics_ui.col_product_sku') }}
              </th>
              <th
                scope="col"
                class="label-caps px-3 py-3 text-start font-normal"
              >
                {{ $t('analytics_ui.col_category') }}
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                {{ $t('analytics_ui.col_units_dispatched') }}
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                {{ $t('analytics_ui.gross_revenue') }}
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                {{ $t('analytics_ui.margin') }}
              </th>
              <th
                scope="col"
                class="label-caps px-3 py-3 text-start font-normal"
              >
                {{ $t('analytics_ui.col_stock_velocity') }}
              </th>
              <th
                scope="col"
                class="label-caps px-4 py-3 text-start font-normal"
              >
                {{ $t('common_ui.status') }}
              </th>
            </tr>
          </thead>
          <tbody v-if="pending || !data" class="divide-y divide-line">
            <tr v-for="n in perPage" :key="n">
              <td colspan="7" class="px-4 py-3">
                <LazyVSkeletonLoader class="h-12" />
              </td>
            </tr>
          </tbody>
          <tbody v-else class="divide-y divide-line">
            <tr
              v-for="r in data.rows"
              :key="r.id"
              class="align-top transition-colors duration-fast hover:bg-raised/60"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 w-6 shrink-0 font-mono text-xs text-mute"
                    aria-hidden="true"
                    >{{ String(r.rank).padStart(2, "0") }}</span
                  >
                  <LazyVIconTile :icon="r.icon" size="sm" />
                  <div class="min-w-0">
                    <p class="font-medium leading-snug">{{ r.name }}</p>
                    <p class="meta" dir="ltr">{{ r.sku }} · {{ r.spec }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3.5 text-xs text-mute">
                {{ categories.label(r.category) }}
              </td>
              <td class="px-3 py-3.5 text-end font-mono text-xs tabular-nums">
                {{ number(r.units) }}
              </td>
              <td
                class="px-3 py-3.5 text-end font-mono text-xs font-semibold tabular-nums"
              >
                {{ currency(r.revenue, { maximumFractionDigits: 0 }) }}
              </td>
              <td
                class="px-3 py-3.5 text-end font-mono text-xs tabular-nums"
                :class="r.margin >= 40 ? 'text-success' : ''"
              >
                {{ percent(r.margin) }}
              </td>
              <td class="w-44 px-3 py-3.5">
                <p class="font-mono text-xs tabular-nums">
                  {{ $t('analytics_ui.days_buffer_long', { days: r.daysLeft >= 365 ? "365+" : number(r.daysLeft) }) }}
                </p>
                <LazyVMeter
                  class="my-1"
                  :value="Math.min(100, (r.daysLeft / 45) * 100)"
                  :tone="velocityMeta[r.status].tone"
                  :label="$t('analytics_ui.stock_buffer_for', { name: r.name })"
                />
                <p class="meta">{{ $t('analytics_ui.units_per_day', { n: r.perDay }) }}</p>
              </td>
              <td class="px-4 py-3.5">
                <LazyVStatusBadge
                  :tone="velocityMeta[r.status].tone"
                  :icon="velocityMeta[r.status].icon"
                  >{{ velocityLabel[r.status] }}</LazyVStatusBadge
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Narrower screens: cards -->
      <ul
        class="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:hidden"
        :aria-busy="pending || undefined"
      >
        <template v-if="pending || !data">
          <li v-for="n in Math.min(perPage, 4)" :key="n">
            <LazyVSkeletonLoader class="h-36" />
          </li>
        </template>
        <li
          v-for="r in pending || !data ? [] : data.rows"
          :key="r.id"
          class="space-y-2 rounded-card border border-line bg-surface p-3"
        >
          <div class="flex items-start gap-3">
            <LazyVIconTile :icon="r.icon" size="sm" />
            <div class="min-w-0 flex-1">
              <p class="font-medium leading-snug">
                <span class="font-mono text-xs text-mute">{{
                  String(r.rank).padStart(2, "0")
                }}</span>
                {{ r.name }}
              </p>
              <p class="meta" dir="ltr">{{ r.sku }}</p>
            </div>
            <LazyVStatusBadge :tone="velocityMeta[r.status].tone">{{
              velocityLabel[r.status]
            }}</LazyVStatusBadge>
          </div>
          <dl
            class="grid grid-cols-3 gap-2 text-center font-mono text-xs tabular-nums"
          >
            <div>
              <dt class="label-caps">{{ $t('analytics_ui.col_units') }}</dt>
              <dd class="font-semibold">{{ number(r.units) }}</dd>
            </div>
            <div>
              <dt class="label-caps">{{ $t('dashboard_ui.revenue') }}</dt>
              <dd class="font-semibold">
                {{
                  currency(r.revenue, {
                    maximumFractionDigits: 0,
                    notation: "compact",
                  })
                }}
              </dd>
            </div>
            <div>
              <dt class="label-caps">{{ $t('analytics_ui.margin') }}</dt>
              <dd class="font-semibold">{{ percent(r.margin) }}</dd>
            </div>
          </dl>
          <LazyVMeter
            :value="Math.min(100, (r.daysLeft / 45) * 100)"
            :tone="velocityMeta[r.status].tone"
            :label="$t('analytics_ui.stock_buffer_for', { name: r.name })"
          />
          <p class="meta">
            {{ $t('analytics_ui.days_buffer_long', { days: r.daysLeft >= 365 ? "365+" : r.daysLeft }) }} ·
            {{ $t('analytics_ui.units_per_day', { n: r.perDay }) }}
          </p>
        </li>
      </ul>
    </template>

    <div
      v-if="!error && (pending || data?.rows.length)"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 sm:px-5"
    >
      <p class="font-mono text-2xs text-mute">
        {{
          $t('analytics_ui.aggregated_on_page', {
            units: number(data?.totalUnits ?? 0),
            revenue: currency(data?.totalRevenue ?? 0, { maximumFractionDigits: 0 }),
          })
        }}
      </p>
      <LazyVPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="data?.total ?? 0"
        :per-page-options="[5, 10, 25]"
        show-per-page
        :item-label="$t('analytics_ui.sku_items')"
      />
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { velocityMeta } from "~/data/analytics-meta";
import type {
  AnalyticsQuery,
  TopProductsResponse,
} from "~/types/admin/analytics";
import type { ProductCategory } from "~/types/admin/products";

const categories = useCategories();

const props = defineProps<{
  period: Pick<AnalyticsQuery, "range" | "from" | "to">;
}>();

const { t } = useI18n();
const { number, currency, percent } = useFormatters();

const velocityLabel = computed(() => ({
  restock: t("analytics_ui.velocity_restock"),
  low: t("analytics_ui.velocity_low"),
  optimal: t("analytics_ui.velocity_optimal"),
  healthy: t("analytics_ui.velocity_healthy"),
}));

const q = ref("");
const category = ref<"all" | ProductCategory>("all");
const page = ref(1);
const perPage = ref(5);
const debounced = refDebounced(q, 300);

const query = computed(() => ({
  q: debounced.value,
  category: category.value,
  page: page.value,
  perPage: perPage.value,
  range: props.period.range,
  from: props.period.from,
  to: props.period.to,
}));

const store = useAnalyticsStore();
const { top: data, topPending: pending, topError: error } = storeToRefs(store);
const refresh = () => store.refreshTop();
watch(query, (q) => store.fetchTop(q), { immediate: true });

watch(
  [
    debounced,
    category,
    perPage,
    () => props.period.range,
    () => props.period.from,
    () => props.period.to,
  ],
  () => {
    page.value = 1;
  },
);

const reset = () => {
  q.value = "";
  category.value = "all";
};
</script>