<template>
  <div>
    <div
      v-if="item"
      class="flex items-center gap-3 rounded-card border border-line bg-ink p-3"
    >
      <LazyVIconTile :icon="item.icon" size="sm" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ item.name }}</p>
        <p class="meta" dir="ltr">
          {{ item.sku }} · {{ item.vault }} {{ item.bin }}
        </p>
      </div>
      <p class="text-end font-mono text-xs tabular-nums">
        <span class="block text-base font-semibold">{{ item.stock }}</span>
        in stock
      </p>
      <LazyVButton
        v-if="changeable"
        variant="tertiary"
        size="sm"
        @click="item = null"
        >Change</LazyVButton
      >
    </div>

    <div v-else class="space-y-2">
      <LazyVInput
        v-model="q"
        name="pickerSearch"
        type="search"
        label="Find a product"
        icon="lucide:search"
        autocomplete="off"
        placeholder="SKU, name or EAN"
      />
      <ul
        class="max-h-52 space-y-1 overflow-y-auto"
        aria-label="Matching products"
      >
        <li v-for="r in results" :key="r.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-card border border-line bg-ink p-2.5 text-start transition duration-fast hover:border-accent/60"
            @click="item = r"
          >
            <LazyVIconTile :icon="r.icon" size="sm" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium">{{
                r.name
              }}</span>
              <span class="meta" dir="ltr">{{ r.sku }}</span>
            </span>
            <span class="font-mono text-xs tabular-nums text-mute"
              >{{ r.stock }} in stock</span
            >
          </button>
        </li>
        <li
          v-if="results && !results.length"
          class="px-1 py-2 text-sm text-mute"
        >
          No product matches “{{ debounced }}”.
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { InventoryItem } from "~/types/admin/inventory";

defineProps<{ changeable?: boolean }>();

const item = defineModel<InventoryItem | null>({ default: null });

const q = ref("");
const debounced = refDebounced(q, 250);

const { data: results } = useFetch<InventoryItem[]>(
  "/api/admin/inventory/search",
  {
    query: { q: debounced },
    lazy: true,
  },
);
</script>