<template>
  <LazyVPanel
    :title="$t('orders_ui.line_items')"
    :subtitle="$t('orders_ui.line_items_subtitle', { units: count, batches: lines.length })"
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
          <p class="meta" dir="ltr">{{ $t('orders_ui.sku_label', { sku: line.sku }) }}</p>
          <p class="meta">{{ line.spec }}</p>
        </div>
        <p
          class="col-start-2 font-mono text-xs text-mute tabular-nums sm:col-start-auto sm:text-end"
        >
          <span class="label-caps block">{{ $t('orders_ui.qty_label') }}</span>
          {{ line.quantity }} {{ line.unit }}{{ line.quantity > 1 ? "s" : "" }}
          <span class="block">{{ $t('orders_ui.at_unit_price', { price: currency(line.unitPrice, cents) }) }}</span>
        </p>
        <p
          class="col-start-2 font-mono text-sm font-semibold tabular-nums sm:col-start-auto sm:text-end"
        >
          <span class="label-caps block sm:sr-only">{{ $t('orders_ui.total_amount') }}</span>
          {{ currency(line.total, cents) }}
        </p>
      </li>
    </ul>

    <dl
      class="mt-4 space-y-1.5 rounded-card border border-line bg-ink p-4 font-mono text-xs"
    >
      <div class="flex justify-between gap-4">
        <dt class="text-mute">{{ $t('orders_ui.subtotal') }}</dt>
        <dd class="tabular-nums">{{ currency(pricing.subtotal, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">{{ $t('orders_ui.testing_setup_fee') }}</dt>
        <dd class="tabular-nums">{{ currency(pricing.setupFee, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">{{ $t('orders_ui.shipping_fee') }}</dt>
        <dd class="tabular-nums">{{ currency(pricing.courier, cents) }}</dd>
      </div>
      <div
        v-if="pricing.discount"
        class="flex justify-between gap-4 text-yellow"
      >
        <dt>
          {{ $t('orders_ui.institutional_discount', { rate: Math.round(pricing.discountRate * 100) }) }}
        </dt>
        <dd class="tabular-nums">−{{ currency(pricing.discount, cents) }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt class="text-mute">{{ $t('orders_ui.vat') }}</dt>
        <dd class="tabular-nums">{{ currency(pricing.vat, cents) }}</dd>
      </div>
    </dl>

    <div
      class="mt-3 flex flex-wrap items-end justify-between gap-3 rounded-card border border-line bg-ink p-4"
    >
      <div>
        <p class="font-display text-base font-bold">
          {{ $t('orders_ui.total_amount') }}
        </p>
        <p class="font-mono text-2xs text-success">{{ deliveryNote }}</p>
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
  deliveryNote: string;
}>();

const { currency } = useFormatters();
const cents = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const count = computed(() =>
  props.lines.reduce((sum, l) => sum + l.quantity, 0),
);
</script>