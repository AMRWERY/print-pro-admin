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
          :label="$t('customers_ui.kpi_total_accounts')"
          icon="lucide:users"
          :value="number(kpis.total)"
          :hint="$t('customers_ui.kpi_total_hint', { count: number(kpis.newThisQuarter), retention: percent(kpis.retentionPct) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('customers_ui.kpi_active_clients')"
          icon="lucide:landmark"
          :value="
            currency(kpis.spend, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="$t('customers_ui.kpi_active_hint', { value: currency(kpis.avgLtv, { maximumFractionDigits: 0 }) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          :label="$t('orders_ui.tab_all')"
          icon="lucide:shield-check"
          :value="number(kpis.activeOrders)"
          :hint="$t('customers_ui.kpi_regions_hint', { count: number(kpis.activeClients) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('customers_ui.kpi_enterprise')"
          icon="lucide:award"
          :value="number(kpis.vip)"
          :hint="$t('customers_ui.kpi_enterprise_hint')"
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