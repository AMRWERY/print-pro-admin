<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="inventorySearch"
          type="search"
          label="Filter inventory"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          placeholder="Filter by SKU, name or bin…"
        />
      </form>

      <LazyVSelectInput
        v-model="category"
        name="inventoryDivision"
        label="Division"
        hide-label
        :options="categoryOptions"
      />

      <LazyVSelectInput
        v-model="vault"
        name="inventoryVault"
        label="Vault"
        hide-label
        :options="vaultOptions"
      />

      <LazyVSelectInput
        v-model="sort"
        name="inventorySort"
        label="Sort"
        hide-label
        :options="sortOptions"
      />
    </div>

    <div
      role="group"
      aria-label="Stock level"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95"
        :class="
          filter === tab.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        :aria-pressed="filter === tab.value"
        @click="filter = tab.value"
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
import { categoryOptions } from "~/data/product-meta";
import { filterTabs, sortOptions, vaultOptions } from "~/data/inventory-meta";
import type {
  InventoryFilter,
  InventoryResponse,
  InventorySort,
  Vault,
} from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

defineProps<{ counts?: InventoryResponse["counts"] | null }>();

const q = defineModel<string>("q", { required: true });
const category = defineModel<"all" | ProductCategory>("category", {
  required: true,
});
const vault = defineModel<"all" | Vault>("vault", { required: true });
const filter = defineModel<InventoryFilter>("filter", { required: true });
const sort = defineModel<InventorySort>("sort", { required: true });

const { number } = useFormatters();
</script>