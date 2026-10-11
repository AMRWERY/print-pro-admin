<template>
  <VPanel
    title="Critical low-stock matrix"
    subtitle="Reserve buffers currently below the safe 14-day production velocity threshold"
    icon="lucide:triangle-alert"
  >
    <template #actions>
      <LazyVButton size="sm" icon="lucide:package-plus" icon-class="icon-bob">Trigger emergency batch PO</LazyVButton>
    </template>

    <ul class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" :aria-busy="!items || undefined">
      <template v-if="!items">
        <li v-for="n in 4" :key="n" class="rounded-card border border-line bg-ink p-4">
          <LazyVSkeletonLoader variant="line" class="w-1/3" />
          <LazyVSkeletonLoader class="mt-3 h-10" />
          <LazyVSkeletonLoader class="mt-3 h-8" />
        </li>
      </template>

      <li
        v-for="item in items ?? []"
        :key="item.sku"
        class="flex flex-col gap-3 rounded-card border border-line border-t-2 bg-ink p-4"
        :class="topBorder[item.status]"
      >
        <div class="flex items-center justify-between gap-2">
          <VStatusBadge :tone="tone[item.status]" :icon="icon[item.status]">{{ statusText[item.status] }}</VStatusBadge>
          <span class="font-mono text-2xs text-mute tabular-nums">
            Min {{ item.threshold }}
          </span>
        </div>

        <div class="min-w-0">
          <h3 class="font-display text-base font-bold leading-snug">{{ item.name }}</h3>
          <p class="meta mt-0.5 truncate" dir="ltr">{{ item.sku }} · {{ item.spec }}</p>
        </div>

        <div class="mt-auto space-y-1.5">
          <VMeter
            :value="(item.remaining / item.threshold) * 100"
            :tone="tone[item.status]"
            :label="`Stock level for ${item.name}`"
          />
          <p class="flex flex-wrap justify-between gap-x-2 font-mono text-2xs text-mute">
            <span>Remaining: {{ `${item.remaining} ${item.unit}` }}</span>
            <span>{{ noteText[item.note] }}: {{ item.noteValue }}</span>
          </p>
        </div>

        <LazyVButton variant="secondary" size="sm" block>{{ actionText[item.action] }}</LazyVButton>
      </li>
    </ul>
  </VPanel>
</template>

<script lang="ts" setup>
import type { LowStockItem, StockStatus, Tone } from "~/types/admin/dashboard";

const statusText: Record<string, string> = {
  critical: "Critical reserve",
  depleting: "Depleting",
  scheduled: "Scheduled replenish",
};

const noteText: Record<string, string> = {
  lead: "Supplier lead",
  run: "Mill run",
  edi: "EDI line",
  priority: "Lab priority",
};

const actionText: Record<string, string> = {
  restockLens: "Restock lens PO",
  restockSubstrate: "Restock substrate",
  confirmEdi: "Confirm EDI line",
  emergencySpares: "Emergency spares order",
};


defineProps<{ items?: LowStockItem[] | null }>();

const tone: Record<StockStatus, Tone> = {
  critical: "accent",
  depleting: "warning",
  scheduled: "info",
};
const icon: Record<StockStatus, string> = {
  critical: "lucide:circle-alert",
  depleting: "lucide:triangle-alert",
  scheduled: "lucide:clock",
};
const topBorder: Record<StockStatus, string> = {
  critical: "border-t-accent",
  depleting: "border-t-yellow",
  scheduled: "border-t-cyan",
};
</script>
