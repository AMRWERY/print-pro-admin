<template>
  <!-- counters: compact figures beside the page title (wide screens) -->
  <ul v-if="variant === 'counters'" class="flex items-stretch gap-3">
    <li class="rounded-card border border-line border-s-2 border-s-yellow bg-surface px-3 py-2">
      <p class="label-caps">Escrow backlog</p>
      <p class="font-display text-xl font-bold tabular-nums">{{ number(escrowBacklog) }} <span class="text-xs font-medium text-mute">requisitions</span></p>
    </li>
    <li class="rounded-card border border-line border-s-2 border-s-accent bg-surface px-3 py-2">
      <p class="label-caps">Low-stock alerts</p>
      <p class="font-display text-xl font-bold tabular-nums">{{ number(lowStock) }} <span class="text-xs font-medium text-mute">critical SKUs</span></p>
    </li>
  </ul>

  <!-- strips: actionable banners above the KPIs (tablet and mobile) -->
  <ul v-else class="grid gap-3 md:grid-cols-2">
    <li class="flex items-center gap-3 rounded-card border border-yellow/40 bg-yellow-soft p-3">
      <Icon name="lucide:shield-check" size="18" class="shrink-0 text-yellow" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">Escrow clearing & collimation QA queue</p>
        <p class="truncate text-xs text-mute">{{ number(escrowBacklog) }} studio requisitions pending release</p>
      </div>
      <LazyVButton variant="secondary" size="sm" to="/orders">View batch</LazyVButton>
    </li>
    <li class="flex items-center gap-3 rounded-card border border-accent/40 bg-accent-soft p-3">
      <Icon name="lucide:triangle-alert" size="18" class="shrink-0 text-accent" aria-hidden="true" />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium">Archival depot stock discrepancy</p>
        <p class="truncate text-xs text-mute">{{ number(lowStock) }} master SKUs breach minimum reserve</p>
      </div>
      <LazyVButton variant="secondary" size="sm" to="/cotton-rag-substrates">Audit SKUs</LazyVButton>
    </li>
  </ul>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    escrowBacklog: number;
    lowStock: number;
    variant?: "counters" | "strips";
  }>(),
  { variant: "strips" },
);

const { number } = useFormatters();
</script>
