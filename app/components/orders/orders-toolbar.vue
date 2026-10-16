<template>
  <div class="space-y-4">
    <!-- Stage tabs + view switch -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div
        role="group"
        aria-label="Filter by custody stage"
        class="-mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 pb-1"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs uppercase transition duration-fast active:scale-95"
          :class="
            stage === tab.value
              ? 'border-accent bg-accent text-onaccent'
              : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
          "
          :aria-pressed="stage === tab.value"
          @click="stage = tab.value"
        >
          {{ tab.label }}
          <span class="tabular-nums"
            >({{ counts ? number(counts[tab.value]) : "…" }})</span
          >
        </button>
      </div>

      <LazyVSegmented v-model="view" label="Layout" :options="viewOptions" />
    </div>

    <!-- Filters -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <form
        role="search"
        class="relative sm:col-span-2 lg:col-span-2"
        @submit.prevent
      >
        <LazyVInput
          v-model="q"
          name="orderSearch"
          type="search"
          label="Search requisitions"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          placeholder="Search order ID, client, atelier, equipment…"
        />
      </form>

      <LazyVSelectInput
        v-model="range"
        name="orderRange"
        label="Date range"
        hide-label
        :options="rangeOptions"
      />

      <LazyVSelectInput
        v-model="escrow"
        name="orderEscrow"
        label="Escrow mode"
        hide-label
        :options="escrowOptions"
      />

      <LazyVSelectInput
        v-model="stage"
        name="orderStage"
        label="Custody stage"
        hide-label
        :options="stageSelect"
      />

      <LazyVSelectInput
        v-model="tier"
        name="orderTier"
        label="Client tier"
        hide-label
        :options="tierOptions"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <ul
        v-if="active.length"
        class="flex flex-wrap items-center gap-2"
        aria-label="Active filters"
      >
        <li v-for="chip in active" :key="chip.key">
          <button
            type="button"
            class="chip-link"
            :aria-label="`Remove filter: ${chip.label}`"
            @click="chip.clear()"
          >
            {{ chip.label }}
            <Icon name="lucide:x" size="12" aria-hidden="true" />
          </button>
        </li>
        <li>
          <LazyVButton variant="tertiary" size="sm" @click="clearAll"
            >Clear all</LazyVButton
          >
        </li>
      </ul>
      <span v-else />

      <LazyVSelectInput
        v-model="sort"
        name="orderSort"
        label="Sort"
        inline
        :options="sortOptions"
        class="ms-auto"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  escrowOptions,
  rangeOptions,
  sortOptions,
  stageMeta,
  tierMeta,
  tierOptions,
} from "~/data/order-meta";
import type {
  ClientTier,
  OrderCounts,
  EscrowMode,
  OrderRange,
  OrderSort,
  OrderStage,
} from "~/types/admin/orders";

defineProps<{ counts?: OrderCounts | null }>();

const q = defineModel<string>("q", { required: true });
const stage = defineModel<"all" | OrderStage>("stage", { required: true });
const escrow = defineModel<"all" | EscrowMode>("escrow", { required: true });
const tier = defineModel<"all" | ClientTier>("tier", { required: true });
const range = defineModel<OrderRange>("range", { required: true });
const sort = defineModel<OrderSort>("sort", { required: true });
const view = defineModel<"table" | "kanban">("view", { required: true });

const { number } = useFormatters();

const viewOptions = [
  { value: "table" as const, label: "Table" },
  { value: "kanban" as const, label: "Kanban" },
];

const tabs = computed(() => [
  { value: "all" as const, label: "All orders" },
  ...(Object.keys(stageMeta) as OrderStage[]).map((value) => ({
    value,
    label: stageMeta[value].tab,
  })),
]);

const stageSelect = computed(() => [
  { value: "all", label: "All custody stages" },
  ...(Object.keys(stageMeta) as OrderStage[]).map((value) => ({
    value,
    label: stageMeta[value].tab,
  })),
]);

// Every filter that is not at its default shows up as a removable chip.
const active = computed(() => {
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (q.value)
    chips.push({
      key: "q",
      label: `“${q.value}”`,
      clear: () => (q.value = ""),
    });
  if (range.value !== "all")
    chips.push({
      key: "range",
      label: rangeOptions.find((o) => o.value === range.value)!.label,
      clear: () => (range.value = "all"),
    });
  if (escrow.value !== "all")
    chips.push({
      key: "escrow",
      label: escrowOptions.find((o) => o.value === escrow.value)!.label,
      clear: () => (escrow.value = "all"),
    });
  if (stage.value !== "all")
    chips.push({
      key: "stage",
      label: stageMeta[stage.value].tab,
      clear: () => (stage.value = "all"),
    });
  if (tier.value !== "all")
    chips.push({
      key: "tier",
      label: tierMeta[tier.value].label,
      clear: () => (tier.value = "all"),
    });
  return chips;
});

const clearAll = () => {
  q.value = "";
  range.value = "all";
  escrow.value = "all";
  stage.value = "all";
  tier.value = "all";
};

defineExpose({ clearAll, hasFilters: computed(() => active.value.length > 0) });
</script>