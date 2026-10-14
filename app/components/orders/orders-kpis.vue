<template>
  <ul class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5" :aria-busy="!data || undefined">
    <template v-if="!data">
      <li v-for="n in 5" :key="n" class="card space-y-3 p-4" :class="n === 5 && 'col-span-2 md:col-span-1'">
        <LazyVSkeletonLoader variant="line" class="w-1/2" />
        <LazyVSkeletonLoader class="h-8 w-2/3" />
        <LazyVSkeletonLoader variant="line" class="w-3/4" />
      </li>
    </template>

    <template v-else>
      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-start justify-between gap-2">
          <span class="label-caps">Total requisitions</span>
          <Icon name="lucide:archive" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="flex flex-wrap items-baseline gap-x-2 font-display text-3xl font-bold tabular-nums">
          {{ number(data.kpis.totalRequisitions) }}
          <span class="font-mono text-xs font-semibold text-success">+{{ percent(data.kpis.historicalDelta) }}</span>
        </p>
        <p class="label-caps">All-time historical ledger</p>
      </li>

      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-start justify-between gap-2">
          <span class="label-caps">Total volume</span>
          <Icon name="lucide:landmark" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ currency(data.kpis.volumeEur, { maximumFractionDigits: 0 }) }}</p>
        <p class="font-mono text-2xs text-mute">≈ {{ currency(data.kpis.volumeUsd, { currency: "USD", maximumFractionDigits: 0 }) }} USD</p>
        <p class="label-caps">Rolling 30-day custodial value</p>
      </li>

      <li class="card flex flex-col gap-2 border-s-2 border-s-yellow p-4">
        <p class="flex items-start justify-between gap-2">
          <span class="label-caps">Pending escrow</span>
          <Icon name="lucide:lock" size="16" class="text-yellow" aria-hidden="true" />
        </p>
        <p class="font-display text-3xl font-bold tabular-nums text-yellow">{{ currency(data.kpis.pendingEscrowEur, { maximumFractionDigits: 0 }) }}</p>
        <p class="font-mono text-2xs text-mute">{{ number(data.counts.escrowClearing) }} orders</p>
        <p class="label-caps">Locked pending QA release</p>
      </li>

      <li class="card flex flex-col gap-2 p-4">
        <p class="flex items-start justify-between gap-2">
          <span class="label-caps">Armored freight</span>
          <Icon name="lucide:truck" size="16" class="text-mute" aria-hidden="true" />
        </p>
        <p class="flex flex-wrap items-baseline gap-x-2 font-display text-3xl font-bold tabular-nums">
          {{ number(data.counts.inTransit) }}
          <VStatusBadge tone="success" icon="lucide:truck">Active</VStatusBadge>
        </p>
        <p class="label-caps">High-security courier network</p>
      </li>

      <li class="card col-span-2 flex flex-col gap-2 border-s-2 border-s-accent p-4 md:col-span-1">
        <p class="flex items-start justify-between gap-2">
          <span class="label-caps">QA quarantine hold</span>
          <Icon name="lucide:shield-alert" size="16" class="text-accent" aria-hidden="true" />
        </p>
        <p class="flex flex-wrap items-baseline gap-x-2 font-display text-3xl font-bold tabular-nums">
          {{ data.kpis.quarantineHold }}
          <VStatusBadge tone="accent" icon="lucide:triangle-alert">Flagged</VStatusBadge>
        </p>
        <p class="label-caps">Spectral / MTF interferometry</p>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { OrdersResponse } from "~/types/admin/orders";

defineProps<{ data?: OrdersResponse | null }>();

const { number, currency, percent } = useFormatters();
</script>
