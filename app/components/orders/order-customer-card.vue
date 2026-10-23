<template>
  <LazyVPanel title="Customer details" icon="lucide:contact-round">
    <template #actions>
      <LazyVStatusBadge :tone="tierMeta[customer.tier].tone">{{
        tierMeta[customer.tier].label
      }}</LazyVStatusBadge>
    </template>

    <div class="flex items-center gap-3">
      <LazyVAvatar :initials="customer.initials" shape="square" />
      <div class="min-w-0">
        <p class="font-semibold">{{ customer.name }}</p>
        <p class="meta">{{ details.role }}</p>
        <p class="meta">{{ customer.org }}</p>
      </div>
    </div>

    <dl class="mt-4 space-y-2 text-sm">
      <div class="rounded-control border border-line bg-ink px-3 py-2">
        <dt class="label-caps">Institutional contact</dt>
        <dd class="break-all font-mono text-xs">
          <a
            :href="`mailto:${details.email}`"
            class="hover:text-accent hover:underline"
            >{{ details.email }}</a
          >
        </dd>
      </div>
      <div class="rounded-control border border-line bg-ink px-3 py-2">
        <dt class="label-caps">Secure direct line</dt>
        <dd class="font-mono text-xs" dir="ltr">{{ details.phone }}</dd>
      </div>
      <div class="rounded-control border border-line bg-ink px-3 py-2">
        <dt class="label-caps">Tax / VAT registry</dt>
        <dd class="font-mono text-xs" dir="ltr">{{ details.taxId }}</dd>
      </div>
      <div class="rounded-control border border-line bg-ink px-3 py-2">
        <dt class="label-caps">Lifetime order value</dt>
        <dd class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="font-mono text-sm font-semibold tabular-nums">{{
            currency(details.lifetimeValue, { maximumFractionDigits: 0 })
          }}</span>
          <span class="font-mono text-2xs text-yellow"
            >{{ details.orders }} orders</span
          >
        </dd>
      </div>
    </dl>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { tierMeta } from "~/data/order-meta";
import type { OrderDetail } from "~/types/admin/orders";

defineProps<{
  customer: OrderDetail["row"]["customer"];
  details: OrderDetail["customer"];
}>();

const { currency } = useFormatters();
</script>