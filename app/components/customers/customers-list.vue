<template>
  <div :aria-busy="loading || undefined">
    <ul v-if="loading" class="space-y-2 p-4 sm:p-5">
      <li v-for="n in Math.min(perPage, 8)" :key="n">
        <LazyVSkeletonLoader class="h-16" />
      </li>
    </ul>

    <template v-else>
      <div
        class="flex items-center gap-3 border-b border-line bg-ink px-4 py-2.5"
      >
        <LazyVCheckboxImput
          name="pickAllClients"
          label="Select all clients on this page"
          hide-label
          size="sm"
          :model-value="allSelected"
          :indeterminate="selected.length > 0 && !allSelected"
          :disabled="!rows.length"
          @update:model-value="toggleAll"
        />

        <span class="label-caps">Client &amp; organization</span>
        <span class="label-caps ms-auto hidden sm:block">Telemetry / node</span>
      </div>

      <ul class="divide-y divide-line">
        <li
          v-for="c in rows"
          :key="c.id"
          class="flex items-start gap-3 px-4 py-3 transition-colors duration-fast hover:bg-raised/60"
          :class="selectedId === c.id && 'bg-accent-soft'"
        >
          <LazyVCheckboxImput
            :name="`pick-${c.id}`"
            :label="`Select ${c.name}`"
            hide-label
            size="sm"
            class="mt-2.5"
            :model-value="selected.includes(c.id)"
            @update:model-value="toggle(c.id)"
          />

          <button
            type="button"
            class="grid min-w-0 flex-1 gap-x-4 gap-y-1 rounded-card text-start sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
            :aria-current="selectedId === c.id ? 'true' : undefined"
            @click="emit('select', c.id)"
          >
            <span class="flex min-w-0 items-center gap-3">
              <LazyVAvatar :initials="c.initials" shape="square" />
              <span class="min-w-0">
                <span
                  class="flex flex-wrap items-center gap-x-2 font-medium leading-snug"
                >
                  {{ c.name }}
                  <Icon
                    v-if="c.tier === 'AAA'"
                    name="lucide:badge-check"
                    size="14"
                    class="text-yellow"
                    aria-label="AAA institutional tier"
                  />
                </span>
                <span class="meta block truncate">{{ c.org }}</span>
                <span class="meta block truncate">{{ c.role }}</span>
              </span>
            </span>
            <span class="min-w-0 ps-0 font-mono text-xs sm:pt-0.5">
              <span class="block truncate" dir="ltr">{{ c.email }}</span>
              <span class="block text-mute" dir="ltr">{{ c.phone }}</span>
              <span class="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span class="flex items-center gap-1 text-mute"
                  ><Icon name="lucide:map-pin" size="12" aria-hidden="true" />{{
                    c.node
                  }}</span
                >
                <LazyVStatusBadge :tone="segmentMeta[c.segment].tone">{{
                  segmentMeta[c.segment].short
                }}</LazyVStatusBadge>

                <LazyVStatusBadge
                  v-if="c.status !== 'active'"
                  :tone="statusMeta[c.status].tone"
                  :icon="statusMeta[c.status].icon"
                  >{{ statusMeta[c.status].label }}</LazyVStatusBadge
                >
              </span>
            </span>
          </button>
          <LazyVRowActions
            class="mt-1.5"
            :label="`Actions for ${c.name}`"
            @edit="emit('edit', c)"
            @remove="emit('remove', c)"
          />
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { segmentMeta, statusMeta } from "~/data/customer-meta";
import type { Customer } from "~/types/admin/customers";

const props = defineProps<{
  rows: Customer[];
  loading?: boolean;
  perPage: number;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [id: string];
  edit: [customer: Customer];
  remove: [customer: Customer];
}>();

const selected = defineModel<string[]>("selected", { default: () => [] });

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((r) => selected.value.includes(r.id)),
);

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};

const toggleAll = () => {
  selected.value = allSelected.value ? [] : props.rows.map((r) => r.id);
};
</script>