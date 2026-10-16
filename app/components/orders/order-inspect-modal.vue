<template>
  <LazyVDialog
    v-model:open="open"
    :title="row ? `Requisition ${row.id}` : 'Requisition'"
    description="Chain-of-custody record, escrow ledger and allocation"
    size="lg"
  >
    <div v-if="row" class="space-y-5">
      <div class="flex flex-wrap items-center gap-2">
        <LazyVStatusBadge :tone="priorityMeta[row.priority].tone">{{
          priorityMeta[row.priority].label
        }}</LazyVStatusBadge>

        <LazyVStatusBadge
          :tone="stageMeta[row.stage].escrowTone"
          :icon="stageMeta[row.stage].escrowIcon"
          >{{ stageMeta[row.stage].escrow }}</LazyVStatusBadge
        >

        <LazyVStatusBadge
          :tone="stageMeta[row.stage].custodyTone"
          :icon="stageMeta[row.stage].custodyIcon"
          >{{ stageMeta[row.stage].custody }}</LazyVStatusBadge
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
          <dt class="label-caps mt-3">Ledger hash</dt>
          <dd class="flex items-center gap-2 font-mono text-sm" dir="ltr">
            {{ row.hex }}
            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:copy"
              aria-label="Copy ledger hash"
              @click="copy(row.hex)"
            />
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="label-caps">Apparatus &amp; media allocation</dt>
          <dd class="font-medium">{{ row.allocation.title }}</dd>
          <dd class="meta">
            {{ row.allocation.quantity }}× {{ row.allocation.unit
            }}{{ row.allocation.quantity > 1 ? "s" : "" }} ·
            {{ row.allocation.spec }}
          </dd>
        </div>
        <div>
          <dt class="label-caps">Escrow value</dt>
          <dd class="font-display text-2xl font-bold tabular-nums">
            {{ currency(row.amount, { maximumFractionDigits: 0 }) }}
          </dd>
          <dd class="meta">{{ row.escrowNote }}</dd>
        </div>
        <div>
          <dt class="label-caps">Custody</dt>
          <dd class="font-medium">{{ stageMeta[row.stage].custody }}</dd>
          <dd class="meta">{{ row.custodyNote }}</dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <LazyVButton variant="secondary" @click="open = false">Close</LazyVButton>
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
    toast.success("Ledger hash copied");
  } catch {
    toast.error("Couldn't copy", {
      description: "Select the hash and copy it manually.",
    });
  }
};
</script>