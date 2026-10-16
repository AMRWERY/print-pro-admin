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
          label="Revenue"
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
          label="Orders"
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
          label="Customers"
          icon="lucide:users"
          :value="number(kpis.customers.value)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >+{{ number(kpis.customers.delta) }} new</LazyVStatusBadge
          >
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          label="Products"
          icon="lucide:package"
          :value="number(kpis.products.value)"
          hint="in catalog"
        />
      </li>
      <li>
        <LazyVStatCard
          label="Low-stock alerts"
          icon="lucide:triangle-alert"
          tone="accent"
          to="/inventory"
          :value="number(kpis.lowStock.value)"
          hint="Review inventory"
        />
      </li>
      <li>
        <LazyVStatCard
          label="Pending orders"
          icon="lucide:clock"
          tone="warning"
          to="/orders"
          :value="number(kpis.pendingOrders.value)"
          hint="Awaiting release"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { DashboardKpis } from "~/types/admin/dashboard";

defineProps<{ kpis?: DashboardKpis | null }>();

const { number, currency, signedPercent } = useFormatters();
</script>