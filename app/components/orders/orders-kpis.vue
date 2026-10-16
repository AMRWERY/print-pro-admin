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
          label="Total requisitions"
          icon="lucide:archive"
          :value="number(data.kpis.totalRequisitions)"
          hint="All-time historical ledger"
        >
          <template #value>
            {{ number(data.kpis.totalRequisitions) }}
            <span class="font-mono text-xs font-semibold text-success"
              >+{{ percent(data.kpis.historicalDelta) }}</span
            >
          </template>
        </LazyVStatCard>
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          label="Total volume"
          icon="lucide:landmark"
          :value="currency(data.kpis.volumeEur, { maximumFractionDigits: 0 })"
          hint="Rolling 30-day custodial value"
        >
          <p class="font-mono text-2xs text-mute">
            ≈
            {{
              currency(data.kpis.volumeUsd, {
                currency: "USD",
                maximumFractionDigits: 0,
              })
            }}
            USD
          </p>
        </LazyVStatCard>
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          label="Pending escrow"
          icon="lucide:lock"
          :value="
            currency(data.kpis.pendingEscrowEur, { maximumFractionDigits: 0 })
          "
          hint="Locked pending QA release"
        >
          <p class="font-mono text-2xs text-mute">
            {{ number(data.counts.escrowClearing) }} orders
          </p>
        </LazyVStatCard>
      </li>

      <li>
        <LazyVStatCard
          size="lg"
          label="Armored freight"
          icon="lucide:truck"
          hint="High-security courier network"
        >
          <template #value>
            {{ number(data.counts.inTransit) }}
            <LazyVStatusBadge tone="success" icon="lucide:truck"
              >Active</LazyVStatusBadge
            >
          </template>
        </LazyVStatCard>
      </li>

      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard
          size="lg"
          tone="accent"
          label="QA quarantine hold"
          icon="lucide:shield-alert"
          hint="Spectral / MTF interferometry"
        >
          <template #value>
            {{ data.kpis.quarantineHold }}
            <LazyVStatusBadge tone="accent" icon="lucide:triangle-alert"
              >Flagged</LazyVStatusBadge
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