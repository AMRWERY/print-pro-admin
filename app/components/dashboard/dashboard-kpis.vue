<template>
  <ul
    class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li v-for="n in 6" :key="n"><LazyVStatCard loading /></li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          :label="t('dashboard_ui.revenue')"
          icon="lucide:banknote"
          :value="currency(kpis.revenue.value, { maximumFractionDigits: 0 })"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.revenue.delta) }}</LazyVStatusBadge
          >

          <dashboard-sparkline :values="kpis.revenue.trend" />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          :label="t('dashboard_ui.orders')"
          icon="lucide:receipt-text"
          :value="number(kpis.orders.value)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.orders.delta) }}</LazyVStatusBadge
          >
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          :label="t('dashboard_ui.customers')"
          icon="lucide:users"
          :value="number(kpis.customers.value)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ t('dashboard_ui.new_customers', { n: number(kpis.customers.delta) }) }}</LazyVStatusBadge
          >
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          :label="t('dashboard_ui.products')"
          icon="lucide:package"
          :value="number(kpis.products.value)"
          :hint="t('dashboard_ui.in_catalog')"
        />
      </li>
      <li>
        <LazyVStatCard
          :label="t('dashboard_ui.inventory_alerts')"
          icon="lucide:triangle-alert"
          tone="accent"
          to="/inventory"
          :value="number(kpis.lowStock.value)"
          :hint="t('btn.view_inventory')"
        />
      </li>
      <li>
        <LazyVStatCard
          :label="t('orders_ui.tab_awaiting_payment')"
          icon="lucide:clock"
          tone="warning"
          to="/orders"
          :value="number(kpis.pendingOrders.value)"
          :hint="t('orders_ui.stage_awaiting_payment')"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { DashboardKpis } from "~/types/admin/dashboard";

defineProps<{ kpis?: DashboardKpis | null }>();

const { t } = useI18n();
const { number, currency, signedPercent } = useFormatters();
</script>