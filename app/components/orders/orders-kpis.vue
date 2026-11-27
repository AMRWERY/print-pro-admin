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
          :label="$t('orders_ui.kpi_total_orders')"
          icon="lucide:archive"
          :value="number(data.kpis.totalOrders)"
          :hint="$t('orders_ui.kpi_total_orders_hint')"
        >
          <template #value>
            {{ number(data.kpis.totalOrders) }}
            <span class="font-mono text-xs font-semibold text-success"
              >+{{ percent(data.kpis.historicalDelta) }}</span
            >
          </template>
        </LazyVStatCard>
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('orders_ui.kpi_total_volume')"
          icon="lucide:landmark"
          :value="currency(data.kpis.volume, { maximumFractionDigits: 0 })"
          :hint="$t('orders_ui.kpi_volume_hint')"
        />
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          :label="$t('orders_ui.kpi_awaiting_payment')"
          icon="lucide:lock"
          :value="
            currency(data.kpis.pendingPayment, { maximumFractionDigits: 0 })
          "
          :hint="$t('orders_ui.kpi_awaiting_hint')"
        >
          <p class="font-mono text-2xs text-mute">
            {{ number(data.counts.awaitingPayment) }} {{ $t('orders_ui.title') }}
          </p>
        </LazyVStatCard>
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('orders_ui.kpi_dispatched')"
          icon="lucide:truck"
          :hint="$t('orders_ui.kpi_dispatched_hint')"
        >
          <template #value>
            {{ number(data.counts.inTransit) }}
            <LazyVStatusBadge tone="success" icon="lucide:truck"
              >{{ $t('common_ui.active') }}</LazyVStatusBadge
            >
          </template>
        </LazyVStatCard>
      </li>

      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard
          size="lg"
          tone="accent"
          :label="$t('orders_ui.kpi_testing_packing')"
          icon="lucide:shield-alert"
          :hint="$t('orders_ui.kpi_testing_hint')"
        >
          <template #value>
            {{ data.kpis.onHold }}
            <LazyVStatusBadge tone="accent" icon="lucide:triangle-alert"
              >{{ $t('orders_ui.flagged') }}</LazyVStatusBadge
            >
          </template>
        </LazyVStatCard>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { OrdersResponse } from "~/types/admin/orders";

defineProps<{ data?: OrdersResponse | null }>();

const { number, currency, percent } = useFormatters();
</script>