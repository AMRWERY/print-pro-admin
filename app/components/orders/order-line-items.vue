<template>
  <LazyVPanel
    title="Allocated equipment & substrates"
    :subtitle="`${count} ${count === 1 ? 'unit' : 'units'} across ${lines.length} ${lines.length === 1 ? 'batch' : 'batches'}`"
    icon="lucide:package"
  >
    <ul class="space-y-3">
      <li
        v-for="line in lines"
        :key="line.sku"
        class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-card border border-line bg-ink p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
      >
        <LazyVIconTile :icon="line.icon" />

        <div class="min-w-0">
          <p class="font-medium leading-snug">{{ line.title }}</p>
          <p class="meta" dir="ltr">SKU: {{ line.sku }}</p>
          <p class="meta">{{ line.spec }}</p>
        </div>
        <p
          class="col-start-2 font-mono text-xs text-mute tabular-nums sm:col-start-auto sm:text-end"
        >
          <span class="label-caps block">Qty</span>
          {{ line.quantity }} {{ line.unit }}{{ line.quantity > 1 ? "s" : "" }}
          <span class="block">@ {{ currency(line.unitPrice, cents) }}</span>
        </p>
        <p
          class="col-start-2 font-mono text-sm font-semibold tabular-nums sm:col-start-auto sm:text-end"
        >
          <span class="label-caps block sm:sr-only">Total</span>
          {{ currency(line.total, cents) }}
        </p>
      </li>
    </ul>

    <dl
      class="mt-4 space-y-1.5 rounded-card border border-line bg-ink p-4 font-mono text-xs"
    >
      <div class="flex justify-between gap-4">
        <dt class="text-mute">Subtotal allocated substrates</dt>
        <dd class="tabular-nums">{{ currency(pricing.subtotal, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">Cleanroom QA & spectro-profiling fee</dt>
        <dd class="tabular-nums">{{ currency(pricing.qaFee, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">Armored courier climate transit (insured)</dt>
        <dd class="tabular-nums">{{ currency(pricing.courier, cents) }}</dd>
      </div>
      <div
        v-if="pricing.discount"
        class="flex justify-between gap-4 text-yellow"
      >
        <dt>
          Institutional discount (−{{
            Math.round(pricing.discountRate * 100)
          }}%)
        </dt>
        <dd class="tabular-nums">−{{ currency(pricing.discount, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">Value added tax (19%)</dt>
        <dd class="tabular-nums">{{ currency(pricing.vat, cents) }}</dd>
      </div>
    </dl>

    <div
      class="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-card border border-line bg-ink p-4"
    >
      <div>
        <p class="font-display text-base font-bold">
          Total escrow requisition value
        </p>
        <p class="font-mono text-2xs text-success">{{ vaultNote }}</p>
      </div>
      <p class="font-display text-3xl font-bold tabular-nums text-accent">
        {{ currency(pricing.total, cents) }}
      </p>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { OrderLine, OrderPricing } from "~/types/admin/orders";

const props = defineProps<{
  lines: OrderLine[];
  pricing: OrderPricing;
  vaultNote: string;
}>();

const { currency } = useFormatters();
const cents = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const count = computed(() =>
  props.lines.reduce((sum, l) => sum + l.quantity, 0),
);
</script>