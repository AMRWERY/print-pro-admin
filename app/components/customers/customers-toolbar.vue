<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="customerSearch"
          type="search"
          label="Search clients"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          placeholder="Search name, studio, email…"
        />
      </form>

      <LazyVSelectInput
        v-model="status"
        name="customerStatus"
        label="Status"
        hide-label
        :options="statusOptions"
      />

      <LazyVSelectInput
        v-model="activity"
        name="customerActivity"
        label="Activity"
        hide-label
        :options="activityOptions"
      />

      <LazyVSelectInput
        v-model="sort"
        name="customerSort"
        label="Sort"
        hide-label
        :options="sortOptions"
      />
    </div>

    <div
      role="group"
      aria-label="Client segment"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95"
        :class="
          segment === tab.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        :aria-pressed="segment === tab.value"
        @click="segment = tab.value"
      >
        {{ tab.label }}
        <span class="tabular-nums"
          >({{ counts ? number(counts[tab.value]) : "…" }})</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  activityOptions,
  segmentMeta,
  sortOptions,
  statusOptions,
} from "~/data/customer-meta";
import type {
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomersResponse,
} from "~/types/admin/customers";

defineProps<{ counts?: CustomersResponse["counts"] | null }>();

const q = defineModel<string>("q", { required: true });
const segment = defineModel<"all" | CustomerSegment>("segment", {
  required: true,
});
const status = defineModel<"all" | CustomerStatus>("status", {
  required: true,
});
const activity = defineModel<CustomerActivity>("activity", { required: true });
const sort = defineModel<CustomerSort>("sort", { required: true });

const { number } = useFormatters();

const tabs = [
  { value: "all" as const, label: "All clients" },
  ...(Object.keys(segmentMeta) as CustomerSegment[]).map((value) => ({
    value,
    label: segmentMeta[value].tab,
  })),
];
</script>