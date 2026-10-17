<template>
  <LazyVPanel
    title="Best-selling apparatus & inventory telemetry"
    subtitle="Stock velocity, revenue and margin by SKU, with days of buffer left"
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
            label="Filter SKUs"
            hide-label
            icon="lucide:search"
            autocomplete="off"
            placeholder="Filter SKU…"
          />
        </form>
        <LazyVSelectInput
          v-model="category"
          name="analyticsCategory"
          label="Division"
          hide-label
          :options="categoryOptions"
          class="w-44"
        />
      </div>
    </template>

    <div v-if="error" class="p-4 sm:p-5">
      <LazyVErrorBanner
        message="The product ranking could not be loaded."
        @retry="() => refresh()"
      />
    </div>

    <div v-else-if="!pending && data && !data.rows.length" class="p-4 sm:p-5">
      <LazyVEmptyState
        bare
        icon="lucide:search-x"
        title="No SKUs match"
        description="Try another name or SKU, or the All divisions filter."
      >
        <LazyVButton variant="secondary" @click="reset"
          >Clear filters</LazyVButton
        >
      </LazyVEmptyState>
    </div>

    <template v-else>
      <!-- Wide screens: table -->
      <div class="hidden xl:block">
        <table class="w-full text-sm" :aria-busy="pending || undefined">
          <caption class="sr-only">
            Best-selling apparatus
          </caption>
          <thead>
            <tr class="border-y border-line bg-ink">
              <th
                scope="col"
                class="label-caps px-4 py-3 text-start font-normal"
              >
                Apparatus / SKU
              </th>
              <th
                scope="col"
                class="label-caps px-3 py-3 text-start font-normal"
              >
                Category node
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                Units dispatched
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                Gross revenue
              </th>
              <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
                Margin
              </th>
              <th
                scope="col"
                class="label-caps px-3 py-3 text-start font-normal"
              >
                Stock velocity
              </th>
              <th
                scope="col"
                class="label-caps px-4 py-3 text-start font-normal"
              >
                Status
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
                {{ categoryMeta[r.category].label }}
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
                  {{ r.daysLeft >= 365 ? "365+" : number(r.daysLeft) }} days
                  buffer
                </p>
                <LazyVMeter
                  class="my-1"
                  :value="Math.min(100, (r.daysLeft / 45) * 100)"
                  :tone="velocityMeta[r.status].tone"
                  :label="`Stock buffer for ${r.name}`"
                />
                <p class="meta">{{ r.perDay }} units/day</p>
              </td>
              <td class="px-4 py-3.5">
                <LazyVStatusBadge
                  :tone="velocityMeta[r.status].tone"
                  :icon="velocityMeta[r.status].icon"
                  >{{ velocityMeta[r.status].label }}</LazyVStatusBadge
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
              velocityMeta[r.status].label
            }}</LazyVStatusBadge>
          </div>
          <dl
            class="grid grid-cols-3 gap-2 text-center font-mono text-xs tabular-nums"
          >
            <div>
              <dt class="label-caps">Units</dt>
              <dd class="font-semibold">{{ number(r.units) }}</dd>
            </div>
            <div>
              <dt class="label-caps">Revenue</dt>
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
              <dt class="label-caps">Margin</dt>
              <dd class="font-semibold">{{ percent(r.margin) }}</dd>
            </div>
          </dl>
          <LazyVMeter
            :value="Math.min(100, (r.daysLeft / 45) * 100)"
            :tone="velocityMeta[r.status].tone"
            :label="`Stock buffer for ${r.name}`"
          />
          <p class="meta">
            {{ r.daysLeft >= 365 ? "365+" : r.daysLeft }} days buffer ·
            {{ r.perDay }} units/day
          </p>
        </li>
      </ul>
    </template>

    <div
      v-if="!error && (pending || data?.rows.length)"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 sm:px-5"
    >
      <p class="font-mono text-2xs text-mute">
        Aggregated on this page: {{ number(data?.totalUnits ?? 0) }} units ·
        {{ currency(data?.totalRevenue ?? 0, { maximumFractionDigits: 0 }) }}
      </p>
      <LazyVPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="data?.total ?? 0"
        :per-page-options="[5, 10, 25]"
        show-per-page
        item-label="SKUs"
      />
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { velocityMeta } from "~/data/analytics-meta";
import { categoryMeta, categoryOptions } from "~/data/product-meta";
import type {
  AnalyticsQuery,
  TopProductsResponse,
} from "~/types/admin/analytics";
import type { ProductCategory } from "~/types/admin/products";

const props = defineProps<{
  period: Pick<AnalyticsQuery, "range" | "from" | "to">;
}>();

const { number, currency, percent } = useFormatters();

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

const { data, pending, error, refresh } = useFetch<TopProductsResponse>(
  "/api/admin/analytics/top-products",
  { lazy: true, query },
);

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