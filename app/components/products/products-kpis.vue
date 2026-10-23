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
          label="Products listed"
          icon="lucide:archive"
          :value="number(data.kpis.registered)"
          :hint="`+${data.kpis.indexedThisCycle} added this month`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Stock value"
          icon="lucide:landmark"
          :value="
            currency(data.kpis.valuation, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          hint="Stock on hand at unit price"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="accent"
          label="Depletion alerts"
          icon="lucide:triangle-alert"
          :value="number(data.kpis.depleted)"
          hint="Critical SKUs at or below reorder point"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="In testing"
          icon="lucide:flask-conical"
          :value="number(data.kpis.testing)"
          hint="Items being tested before listing"
        />
      </li>
      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard
          size="lg"
          label="On hold"
          icon="lucide:shield-alert"
          :value="number(data.kpis.hold)"
          hint="Withdrawn or waiting on the supplier"
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