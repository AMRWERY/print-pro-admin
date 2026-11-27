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
          {{ item.sku }} · {{ item.warehouse }} {{ item.bin }}
        </p>
      </div>
      <p class="text-end font-mono text-xs tabular-nums">
        <span class="block text-base font-semibold">{{ item.stock }}</span>
        {{ $t('inventory_ui.in_stock_label') }}
      </p>
      <LazyVButton
        v-if="changeable"
        variant="tertiary"
        size="sm"
        @click="item = null"
        >{{ $t('inventory_ui.change') }}</LazyVButton
      >
    </div>

    <div v-else class="space-y-2">
      <LazyVInput
        v-model="q"
        name="pickerSearch"
        type="search"
        :label="$t('inventory_ui.find_product')"
        icon="lucide:search"
        autocomplete="off"
        :placeholder="$t('inventory_ui.find_placeholder')"
      />
      <ul
        class="max-h-52 space-y-1 overflow-y-auto"
        :aria-label="$t('inventory_ui.matching_products')"
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
              >{{ $t('inventory_ui.n_in_stock', { n: r.stock }) }}</span
            >
          </button>
        </li>
        <li
          v-if="results && !results.length"
          class="px-1 py-2 text-sm text-mute"
        >
          {{ $t('inventory_ui.no_product_match', { term: debounced }) }}
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

const productsStore = useProductsStore();
const results = ref<InventoryItem[] | null>(null);
let ticket = 0;
watch(
  debounced,
  async (term) => {
    const mine = ++ticket;
    try {
      const rows = await productsStore.searchStock(term);
      if (mine === ticket) results.value = rows;
    } catch {
      // keep the previous suggestions
    }
  },
  { immediate: true },
);
</script>