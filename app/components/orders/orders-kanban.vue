<template>
  <div
    class="grid gap-3 overflow-x-auto p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-5"
  >
    <section
      v-for="col in columns"
      :key="col.stage"
      class="flex min-w-0 flex-col gap-2 rounded-card border border-line bg-ink p-2.5"
      :aria-labelledby="`kb-${col.stage}`"
    >
      <h3
        :id="`kb-${col.stage}`"
        class="flex items-center justify-between gap-2 px-1 font-mono text-xs uppercase"
      >
        <span class="flex items-center gap-1.5">
          <Icon
            :name="stageMeta[col.stage].custodyIcon"
            size="14"
            aria-hidden="true"
          />
          {{ stageMeta[col.stage].tab }}
        </span>
        <span class="chip">{{ loading ? "…" : col.rows.length }}</span>
      </h3>

      <template v-if="loading">
        <LazyVSkeletonLoader v-for="n in 2" :key="n" class="h-24" />
      </template>
      <p
        v-else-if="!col.rows.length"
        class="rounded-card border border-dashed border-line px-3 py-6 text-center text-xs text-mute"
      >
        No requisitions on this page
      </p>
      <ul v-else class="space-y-2">
        <li v-for="row in col.rows" :key="row.id">
          <button
            type="button"
            class="w-full space-y-1.5 rounded-card border border-line bg-surface p-3 text-start transition duration-fast hover:border-accent/60"
            @click="emit('inspect', row)"
          >
            <span class="flex items-center justify-between gap-2">
              <span
                class="font-mono text-xs font-semibold text-accent"
                dir="ltr"
                >{{ row.id }}</span
              >
              <LazyVStatusBadge :tone="priorityMeta[row.priority].tone">{{
                priorityMeta[row.priority].label
              }}</LazyVStatusBadge>
            </span>
            <span class="block text-sm font-medium">{{
              row.customer.name
            }}</span>
            <span class="block text-xs leading-snug text-mute">{{
              row.allocation.title
            }}</span>
            <span class="block font-mono text-xs font-semibold tabular-nums">{{
              currency(row.amount, { maximumFractionDigits: 0 })
            }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { priorityMeta, stageMeta } from "~/data/order-meta";
import type { OrderRow, OrderStage } from "~/types/admin/orders";

const props = defineProps<{ rows: OrderRow[]; loading?: boolean }>();

const emit = defineEmits<{ inspect: [row: OrderRow] }>();

const { currency } = useFormatters();

const columns = computed(() =>
  (Object.keys(stageMeta) as OrderStage[]).map((stage) => ({
    stage,
    rows: props.rows.filter((r) => r.stage === stage),
  })),
);
</script>