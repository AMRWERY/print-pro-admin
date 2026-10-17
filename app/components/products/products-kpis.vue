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
          label="Active register"
          icon="lucide:archive"
          :value="number(data.kpis.registered)"
          :hint="`+${data.kpis.indexedThisCycle} indexed this cycle`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total valuation"
          icon="lucide:landmark"
          :value="
            currency(data.kpis.valuationEur, {
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
          label="Bench metrology"
          icon="lucide:microscope"
          :value="number(data.kpis.bench)"
          hint="Units in polishing / QA"
        />
      </li>
      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard
          size="lg"
          label="Quarantined"
          icon="lucide:shield-alert"
          :value="number(data.kpis.quarantine)"
          hint="Awaiting vendor recertification"
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