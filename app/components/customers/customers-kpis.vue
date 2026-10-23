<template>
  <ul
    class="grid grid-cols-2 gap-3 xl:grid-cols-4"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li v-for="n in 4" :key="n">
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total registered clients"
          icon="lucide:users"
          :value="number(kpis.total)"
          :hint="`+${number(kpis.newThisQuarter)} this quarter · ${percent(kpis.retentionPct)} retention`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total customer spend"
          icon="lucide:landmark"
          :value="
            currency(kpis.spend, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="`Average lifetime value ${currency(kpis.avgLtv, { maximumFractionDigits: 0 })}`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          label="Open orders"
          icon="lucide:shield-check"
          :value="number(kpis.activeOrders)"
          :hint="`Across ${number(kpis.activeClients)} regions`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Key accounts (AAA)"
          icon="lucide:award"
          :value="number(kpis.vip)"
          hint="Dedicated account manager"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { CustomersResponse } from "~/types/admin/customers";

defineProps<{ kpis?: CustomersResponse["kpis"] | null }>();

const { number, currency, percent } = useFormatters();
</script>