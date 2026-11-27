<template>
  <ul
    class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
    :aria-busy="!data || undefined"
  >
    <template v-if="!data">
      <li
        v-for="n in 5"
        :key="n"
        :class="n === 5 && 'col-span-2 md:col-span-1'"
      >
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('products_ui.products_listed')"
          icon="lucide:archive"
          :value="number(data.kpis.registered)"
          :hint="$t('products_ui.added_to_catalog', { count: data.kpis.indexedThisCycle })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('products_ui.stock_value')"
          icon="lucide:landmark"
          :value="
            currency(data.kpis.valuation, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="$t('products_ui.stock_value_hint')"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="accent"
          :label="$t('products_ui.depletion_alerts')"
          icon="lucide:triangle-alert"
          :value="number(data.kpis.depleted)"
          :hint="$t('products_ui.depletion_hint')"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('products_ui.status_testing')"
          icon="lucide:flask-conical"
          :value="number(data.kpis.testing)"
          :hint="$t('products_ui.testing_hint')"
        />
      </li>
      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard
          size="lg"
          :label="$t('products_ui.status_hold')"
          icon="lucide:shield-alert"
          :value="number(data.kpis.hold)"
          :hint="$t('products_ui.hold_hint')"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { ProductsResponse } from "~/types/admin/products";

defineProps<{ data?: ProductsResponse | null }>();

const { number, currency } = useFormatters();
</script>