<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="productSearch"
          type="search"
          label="Search products"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          placeholder="Search product, SKU, serial…"
        />
      </form>

      <LazyVSelectInput
        v-model="category"
        name="productCategory"
        label="Category"
        hide-label
        :options="categoryOptions"
      />

      <LazyVSelectInput
        v-model="brand"
        name="productBrand"
        label="Brand"
        hide-label
        :options="brandOptions"
      />

      <LazyVSelectInput
        v-model="stock"
        name="productStock"
        label="Stock"
        hide-label
        :options="stockOptions"
      />

      <LazyVSelectInput
        v-model="status"
        name="productStatus"
        label="Status"
        hide-label
        :options="statusOptions"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div
        class="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Preset filters"
      >
        <span class="label-caps">Presets</span>
        <button
          v-for="preset in presetList"
          :key="preset.key"
          type="button"
          class="chip-link"
          :class="preset.active && '!border-accent !text-paper'"
          :aria-pressed="preset.active"
          @click="applyPreset(preset.key)"
        >
          {{ preset.label }}
          <span class="tabular-nums"
            >({{ presets ? number(preset.count) : "…" }})</span
          >
        </button>
        <LazyVButton
          v-if="hasFilters"
          variant="tertiary"
          size="sm"
          @click="reset"
          >Reset</LazyVButton
        >
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <LazyVSelectInput
          v-model="sort"
          name="productSort"
          label="Sort"
          inline
          :options="sortOptions"
        />

        <LazyVSegmented
          v-model="view"
          label="Display mode"
          :options="viewOptions"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  categoryOptions,
  sortOptions,
  statusOptions,
  stockOptions,
} from "~/data/product-meta";
import type {
  ProductCategory,
  ProductSort,
  ProductStatus,
  ProductsResponse,
  StockFilter,
} from "~/types/admin/products";

const props = defineProps<{
  presets?: ProductsResponse["presets"] | null;
  brands?: string[];
}>();

const q = defineModel<string>("q", { required: true });
const category = defineModel<"all" | ProductCategory>("category", {
  required: true,
});
const brand = defineModel<string>("brand", { required: true });
const stock = defineModel<StockFilter>("stock", { required: true });
const status = defineModel<"all" | ProductStatus>("status", { required: true });
const sort = defineModel<ProductSort>("sort", { required: true });
const view = defineModel<"ledger" | "cards">("view", { required: true });

const { number } = useFormatters();

const viewOptions = [
  { value: "ledger" as const, label: "Dense ledger" },
  { value: "cards" as const, label: "Cards" },
];

const brandOptions = computed(() => [
  { value: "all", label: "Brand: all" },
  ...(props.brands ?? []).map((b) => ({ value: b, label: b })),
]);

type PresetKey = "hasselbladGlass" | "ragRolls" | "depleted";

const presetList = computed(() => [
  {
    key: "hasselbladGlass" as const,
    label: "Hasselblad prime glass",
    count: props.presets?.hasselbladGlass ?? 0,
    active: brand.value === "Hasselblad AB" && category.value === "glass",
  },
  {
    key: "ragRolls" as const,
    label: "Archival cotton rag rolls",
    count: props.presets?.ragRolls ?? 0,
    active:
      category.value === "rag" &&
      brand.value === "all" &&
      stock.value === "all",
  },
  {
    key: "depleted" as const,
    label: "Depleted alerts only",
    count: props.presets?.depleted ?? 0,
    active: stock.value === "depleted",
  },
]);

const hasFilters = computed(
  () =>
    !!q.value ||
    category.value !== "all" ||
    brand.value !== "all" ||
    stock.value !== "all" ||
    status.value !== "all",
);

const reset = () => {
  q.value = "";
  category.value = "all";
  brand.value = "all";
  stock.value = "all";
  status.value = "all";
};

// A preset replaces the filters, and tapping an active one turns it off again.
const applyPreset = (key: PresetKey) => {
  const wasActive = presetList.value.find((p) => p.key === key)!.active;
  reset();
  if (wasActive) return;
  if (key === "hasselbladGlass") {
    brand.value = "Hasselblad AB";
    category.value = "glass";
  } else if (key === "ragRolls") category.value = "rag";
  else stock.value = "depleted";
};

defineExpose({ reset, hasFilters });
</script>