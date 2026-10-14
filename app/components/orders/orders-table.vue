<template>
  <div :aria-busy="loading || undefined">
    <!-- Desktop: ledger table (scrolls sideways before it gets cramped) -->
    <div class="hidden overflow-x-auto lg:block">
      <table class="w-full min-w-[960px] text-sm">
        <caption class="sr-only">Requisition and escrow ledger</caption>
        <thead>
          <tr class="border-y border-line bg-ink">
            <th scope="col" class="w-10 px-4 py-3">
              <LazyVCheckboxImput
                name="selectAll"
                label="Select all requisitions on this page"
                hide-label
                size="sm"
                :model-value="allSelected"
                :indeterminate="someSelected && !allSelected"
                :disabled="loading || !rows.length"
                @update:model-value="toggleAll"
              />
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Requisition ID</th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Timestamp (UTC)</th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Customer &amp; atelier tier</th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Apparatus &amp; media allocation</th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Escrow ledger</th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">Custody stage</th>
            <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>

        <tbody v-if="loading" class="divide-y divide-line">
          <tr v-for="n in perPage" :key="n">
            <td class="px-4 py-4"><LazyVSkeletonLoader class="h-4 w-4" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader variant="line" class="w-24" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader variant="line" class="w-28" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader class="h-9 w-44" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader class="h-9 w-56" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader class="h-9 w-28" /></td>
            <td class="px-3 py-4"><LazyVSkeletonLoader class="h-9 w-28" /></td>
            <td class="px-4 py-4"><LazyVSkeletonLoader variant="button" class="w-16" /></td>
          </tr>
        </tbody>

        <tbody v-else class="divide-y divide-line">
          <tr
            v-for="row in rows"
            :key="row.id"
            class="align-top transition-colors duration-fast hover:bg-raised/60"
            :class="selected.includes(row.id) && 'bg-accent-soft'"
          >
            <td class="px-4 py-3.5">
              <LazyVCheckboxImput
                :name="`select-${row.id}`"
                :label="`Select requisition ${row.id}`"
                hide-label
                size="sm"
                :model-value="selected.includes(row.id)"
                @update:model-value="toggle(row.id)"
              />
            </td>
            <td class="px-3 py-3.5">
              <div class="flex flex-wrap items-center gap-1.5">
                <button type="button" class="font-mono text-xs font-semibold text-accent hover:underline" dir="ltr" @click="emit('inspect', row)">
                  {{ row.id }}<span class="sr-only"> — inspect</span>
                </button>
                <VStatusBadge :tone="priorityMeta[row.priority].tone">{{ priorityMeta[row.priority].label }}</VStatusBadge>
              </div>
              <p class="meta mt-1" dir="ltr">HEX // {{ row.hex }}</p>
            </td>
            <td class="px-3 py-3.5 font-mono text-xs text-mute tabular-nums" dir="ltr">{{ formatUtc(row.placedAt) }}</td>
            <td class="px-3 py-3.5">
              <div class="flex items-start gap-2.5">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-line bg-raised font-mono text-2xs font-bold" aria-hidden="true">{{ row.customer.initials }}</span>
                <div class="min-w-0">
                  <p class="font-medium">{{ row.customer.name }}</p>
                  <p class="meta">{{ row.customer.org }}</p>
                  <VStatusBadge class="mt-1" :tone="tierMeta[row.customer.tier].tone">{{ tierMeta[row.customer.tier].label }}</VStatusBadge>
                </div>
              </div>
            </td>
            <td class="px-3 py-3.5">
              <div class="flex items-start gap-2.5">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-line bg-raised text-accent" aria-hidden="true">
                  <Icon :name="row.allocation.icon" size="18" />
                </span>
                <div class="min-w-0">
                  <p class="font-medium leading-snug">{{ row.allocation.title }}</p>
                  <p class="meta">{{ row.allocation.quantity }}× {{ row.allocation.unit }}{{ row.allocation.quantity > 1 ? "s" : "" }} · {{ row.allocation.spec }}</p>
                </div>
              </div>
            </td>
            <td class="px-3 py-3.5">
              <p class="font-mono text-sm font-semibold tabular-nums">{{ currency(row.amount, { maximumFractionDigits: 0 }) }}</p>
              <VStatusBadge class="mt-1" :tone="stageMeta[row.stage].escrowTone" :icon="stageMeta[row.stage].escrowIcon">{{ stageMeta[row.stage].escrow }}</VStatusBadge>
              <p class="meta mt-1">{{ row.escrowNote }}</p>
            </td>
            <td class="px-3 py-3.5">
              <VStatusBadge :tone="stageMeta[row.stage].custodyTone" :icon="stageMeta[row.stage].custodyIcon">{{ stageMeta[row.stage].custody }}</VStatusBadge>
              <p class="meta mt-1">{{ row.custodyNote }}</p>
            </td>
            <td class="px-4 py-3.5 text-end">
              <LazyVButton variant="secondary" size="sm" icon="lucide:eye" @click="emit('inspect', row)">Inspect<span class="sr-only"> {{ row.id }}</span></LazyVButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tablet / mobile: one card per requisition -->
    <ul class="divide-y divide-line border-t border-line lg:hidden">
      <template v-if="loading">
        <li v-for="n in perPage" :key="n" class="space-y-3 p-4">
          <LazyVSkeletonLoader variant="line" class="w-1/3" />
          <LazyVSkeletonLoader class="h-10" />
          <LazyVSkeletonLoader class="h-10" />
        </li>
      </template>
      <li
        v-for="row in loading ? [] : rows"
        :key="row.id"
        class="space-y-3 p-4"
        :class="selected.includes(row.id) && 'bg-accent-soft'"
      >
        <div class="flex items-start gap-3">
          <LazyVCheckboxImput
            :name="`select-card-${row.id}`"
            :label="`Select requisition ${row.id}`"
            hide-label
            size="sm"
            :model-value="selected.includes(row.id)"
            @update:model-value="toggle(row.id)"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-1.5">
              <button type="button" class="font-mono text-xs font-semibold text-accent hover:underline" dir="ltr" @click="emit('inspect', row)">{{ row.id }}</button>
              <VStatusBadge :tone="priorityMeta[row.priority].tone">{{ priorityMeta[row.priority].label }}</VStatusBadge>
            </div>
            <p class="meta mt-0.5" dir="ltr">{{ formatUtc(row.placedAt) }}</p>
          </div>
          <p class="font-mono text-sm font-semibold tabular-nums">{{ currency(row.amount, { maximumFractionDigits: 0 }) }}</p>
        </div>
        <div>
          <p class="text-sm font-medium">{{ row.customer.name }}</p>
          <p class="meta">{{ row.customer.org }}</p>
        </div>
        <p class="text-sm leading-snug">
          {{ row.allocation.title }}
          <span class="meta block">{{ row.allocation.quantity }}× {{ row.allocation.unit }}{{ row.allocation.quantity > 1 ? "s" : "" }} · {{ row.allocation.spec }}</span>
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <VStatusBadge :tone="stageMeta[row.stage].escrowTone" :icon="stageMeta[row.stage].escrowIcon">{{ stageMeta[row.stage].escrow }}</VStatusBadge>
          <VStatusBadge :tone="stageMeta[row.stage].custodyTone" :icon="stageMeta[row.stage].custodyIcon">{{ stageMeta[row.stage].custody }}</VStatusBadge>
          <LazyVButton class="ms-auto" variant="secondary" size="sm" icon="lucide:eye" @click="emit('inspect', row)">Inspect</LazyVButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { priorityMeta, stageMeta, tierMeta } from "~/data/order-meta";
import type { OrderRow } from "~/types/admin/orders";

const props = defineProps<{ rows: OrderRow[]; loading?: boolean; perPage: number }>();
const emit = defineEmits<{ inspect: [row: OrderRow] }>();

const selected = defineModel<string[]>("selected", { default: () => [] });

const { currency } = useFormatters();

const allSelected = computed(
  () => props.rows.length > 0 && props.rows.every((r) => selected.value.includes(r.id)),
);
const someSelected = computed(() => selected.value.length > 0);

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};

const toggleAll = () => {
  selected.value = allSelected.value ? [] : props.rows.map((r) => r.id);
};
</script>
