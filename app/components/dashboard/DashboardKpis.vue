<template>
  <ul class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" :aria-busy="!kpis || undefined">
    <template v-if="!kpis">
      <li v-for="n in 6" :key="n" class="card space-y-3 p-4">
        <LazyVSkeletonLoader variant="line" class="w-1/2" />
        <LazyVSkeletonLoader class="h-8 w-2/3" />
        <LazyVSkeletonLoader variant="line" class="w-1/3" />
      </li>
    </template>

    <template v-else>
      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-center justify-between gap-2">
          <span class="label-caps">Revenue</span>
          <Icon name="lucide:banknote" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="font-display text-2xl font-bold tabular-nums">{{ currency(kpis.revenue.value, { maximumFractionDigits: 0 }) }}</p>
        <VStatusBadge class="self-start" tone="success" icon="lucide:trending-up">{{ signedPercent(kpis.revenue.delta) }}</VStatusBadge>
        <DashboardSparkline :values="kpis.revenue.trend" />
      </li>

      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-center justify-between gap-2">
          <span class="label-caps">Orders</span>
          <Icon name="lucide:receipt-text" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="font-display text-2xl font-bold tabular-nums">{{ number(kpis.orders.value) }}</p>
        <VStatusBadge class="self-start" tone="success" icon="lucide:trending-up">{{ signedPercent(kpis.orders.delta) }}</VStatusBadge>
      </li>

      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-center justify-between gap-2">
          <span class="label-caps">Customers</span>
          <Icon name="lucide:users" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="font-display text-2xl font-bold tabular-nums">{{ number(kpis.customers.value) }}</p>
        <VStatusBadge class="self-start" tone="success" icon="lucide:trending-up">+{{ number(kpis.customers.delta) }} new</VStatusBadge>
      </li>

      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-center justify-between gap-2">
          <span class="label-caps">Products</span>
          <Icon name="lucide:package" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="font-display text-2xl font-bold tabular-nums">{{ number(kpis.products.value) }}</p>
        <p class="text-xs text-mute">in catalog</p>
      </li>

      <li class="card border-s-2 border-s-accent">
        <NuxtLinkLocale to="/inventory" class="flex h-full flex-col gap-2 p-4 transition duration-fast hover:bg-raised">
          <span class="flex items-center justify-between gap-2">
            <span class="label-caps">Low-stock alerts</span>
            <Icon name="lucide:triangle-alert" size="16" class="text-accent" aria-hidden="true" />
          </span>
          <span class="font-display text-2xl font-bold tabular-nums text-accent">{{ number(kpis.lowStock.value) }}</span>
          <span class="text-xs text-mute">Review inventory</span>
        </NuxtLinkLocale>
      </li>

      <li class="card border-s-2 border-s-yellow">
        <NuxtLinkLocale to="/orders" class="flex h-full flex-col gap-2 p-4 transition duration-fast hover:bg-raised">
          <span class="flex items-center justify-between gap-2">
            <span class="label-caps">Pending orders</span>
            <Icon name="lucide:clock" size="16" class="text-yellow" aria-hidden="true" />
          </span>
          <span class="font-display text-2xl font-bold tabular-nums text-yellow">{{ number(kpis.pendingOrders.value) }}</span>
          <span class="text-xs text-mute">Awaiting release</span>
        </NuxtLinkLocale>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { DashboardKpis } from "~/types/admin/dashboard";

defineProps<{ kpis?: DashboardKpis | null }>();

const { number, currency, signedPercent } = useFormatters();
</script>
