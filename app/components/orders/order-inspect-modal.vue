<template>
  <LazyVDialog
    v-model:open="open"
    :title="row ? `Order ${row.id}` : 'Order'"
    description="Order status, payment and items"
    size="lg"
  >
    <div v-if="row" class="space-y-5">
      <div class="flex flex-wrap items-center gap-2">
        <LazyVStatusBadge :tone="priorityMeta[row.priority].tone">{{
          priorityMeta[row.priority].label
        }}</LazyVStatusBadge>

        <LazyVStatusBadge
          :tone="stageMeta[row.stage].paymentTone"
          :icon="stageMeta[row.stage].paymentIcon"
          >{{ stageMeta[row.stage].payment }}</LazyVStatusBadge
        >

        <LazyVStatusBadge
          :tone="stageMeta[row.stage].statusTone"
          :icon="stageMeta[row.stage].statusIcon"
          >{{ stageMeta[row.stage].status }}</LazyVStatusBadge
        >
      </div>

      <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        <div>
          <dt class="label-caps">Customer</dt>
          <dd class="font-medium">{{ row.customer.name }}</dd>
          <dd class="meta">{{ row.customer.org }}</dd>
          <dd class="mt-1">
            <LazyVStatusBadge :tone="tierMeta[row.customer.tier].tone">{{
              tierMeta[row.customer.tier].label
            }}</LazyVStatusBadge>
          </dd>
        </div>
        <div>
          <dt class="label-caps">Placed</dt>
          <dd class="font-mono text-sm tabular-nums" dir="ltr">
            {{ formatUtc(row.placedAt) }}
          </dd>
          <dt class="label-caps mt-3">Order reference</dt>
          <dd class="flex items-center gap-2 font-mono text-sm" dir="ltr">
            {{ row.hex }}
            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:copy"
              aria-label="Copy order reference"
              @click="copy(row.hex)"
            />
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="label-caps">Items ordered</dt>
          <dd class="font-medium">{{ row.allocation.title }}</dd>
          <dd class="meta">
            {{ row.allocation.quantity }}× {{ row.allocation.unit
            }}{{ row.allocation.quantity > 1 ? "s" : "" }} ·
            {{ row.allocation.spec }}
          </dd>
        </div>
        <div>
          <dt class="label-caps">Order value</dt>
          <dd class="font-display text-2xl font-bold tabular-nums">
            {{ currency(row.amount, { maximumFractionDigits: 0 }) }}
          </dd>
          <dd class="meta">{{ row.paymentNote }}</dd>
        </div>
        <div>
          <dt class="label-caps">Status</dt>
          <dd class="font-medium">{{ stageMeta[row.stage].status }}</dd>
          <dd class="meta">{{ row.statusNote }}</dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <LazyVButton variant="secondary" @click="open = false">Close</LazyVButton>

      <LazyVButton
        v-if="row"
        :to="`/orders/${row.id.slice(1)}`"
        icon-end="lucide:arrow-up-right"
        icon-end-class="rtl:-scale-x-100"
        >Open full details</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { priorityMeta, stageMeta, tierMeta } from "~/data/order-meta";
import type { OrderRow } from "~/types/admin/orders";

defineProps<{ row: OrderRow | null }>();

const open = defineModel<boolean>("open", { default: false });

const { currency } = useFormatters();
const toast = useToast();

const copy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Order reference copied");
  } catch {
    toast.error("Couldn't copy", {
      description: "Select the hash and copy it manually.",
    });
  }
};
</script>