<template>
  <div class="space-y-5">
    <!-- Title block -->
    <header class="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div class="min-w-0 max-w-2xl space-y-2">
        <nav aria-label="Breadcrumb">
          <ol
            class="flex flex-wrap items-center gap-1.5 font-mono text-xs uppercase text-mute"
          >
            <li>Archival control</li>
            <li aria-hidden="true">/</li>
            <li>Core terminal</li>
            <li aria-hidden="true">/</li>
            <li class="text-accent" aria-current="page">
              Order operations &amp; escrow
            </li>
          </ol>
        </nav>
        <h1
          class="font-display text-2xl font-bold tracking-tight sm:text-3xl xl:text-4xl"
        >
          Order Requisition &amp; Escrow Ledger
        </h1>
        <p class="chip" dir="ltr">STATION ID // CAL-902</p>
        <p class="text-sm text-mute">
          Authorized chain-of-custody transaction clearing house for optical
          systems, master-grade piezo print engines, and archival cotton
          substrates. Dual-signatory escrow protocols active.
        </p>
      </div>

      <div class="flex flex-wrap items-start gap-3">
        <div ref="exportMenu" class="relative">
          <LazyVButton
            variant="secondary"
            icon="lucide:download"
            icon-end="lucide:chevron-down"
            aria-haspopup="menu"
            :aria-expanded="exportOpen"
            @click="exportOpen = !exportOpen"
            >Export manifest</LazyVButton
          >
          <Transition name="fade">
            <ul
              v-if="exportOpen"
              role="menu"
              class="absolute end-0 z-20 mt-2 w-56 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-xl shadow-black/40"
              @keydown.esc="exportOpen = false"
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-raised"
                  @click="exportRows(rows, 'csv')"
                >
                  <Icon
                    name="lucide:file-spreadsheet"
                    size="16"
                    aria-hidden="true"
                  />
                  CSV · this page
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  class="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-raised"
                  @click="exportRows(rows, 'json')"
                >
                  <Icon name="lucide:file-json" size="16" aria-hidden="true" />
                  JSON · this page
                </button>
              </li>
            </ul>
          </Transition>
        </div>

        <LazyVButton icon="lucide:circle-plus" @click="createOpen = true"
          >Create manual requisition</LazyVButton
        >
      </div>
    </header>

    <orders-kpis :data="data" />

    <section class="card" aria-label="Requisition ledger">
      <div class="space-y-4 p-4 sm:p-5">
        <orders-toolbar
          v-model:q="filters.q"
          v-model:stage="filters.stage"
          v-model:escrow="filters.escrow"
          v-model:tier="filters.tier"
          v-model:range="filters.range"
          v-model:sort="filters.sort"
          v-model:view="view"
          :counts="data?.counts"
        />
      </div>

      <div id="ledger" class="scroll-mt-24 border-t border-line">
        <!-- Failed load: the rest of the screen keeps working -->
        <div v-if="error" class="p-5">
          <LazyVEmptyState
            icon="lucide:triangle-alert"
            title="Ledger sync failed"
            description="The requisition ledger could not be reached. Your filters are kept, so retrying picks up where you left off."
            eyebrow="LEDGER :: SYNC_ERROR"
            tag="OFFLINE"
            tag-tone="accent"
          >
            <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
              >Retry sync</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <!-- Nothing matches the filters -->
        <div
          v-else-if="!pending && data && !rows.length && hasFilters"
          class="p-5"
        >
          <LazyVEmptyState
            title="No requisitions match these filters"
            description="Try a different order ID, widen the date range or clear the stage and tier filters."
            eyebrow="QUERY :: NO_RESULTS"
            tag="0 RESULTS"
          >
            <LazyVButton variant="secondary" @click="resetFilters"
              >Clear all filters</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <!-- The ledger itself is empty -->
        <div v-else-if="!pending && data && !rows.length" class="p-5">
          <LazyVEmptyState
            icon="lucide:receipt-text"
            title="No requisitions yet"
            description="New studio requisitions and their escrow clearing appear here as soon as they are placed."
            eyebrow="LEDGER :: EMPTY"
            tag="0 ORDERS"
          >
            <LazyVButton icon="lucide:circle-plus" @click="createOpen = true"
              >Create manual requisition</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <template v-else>
          <orders-kanban
            v-if="view === 'kanban'"
            :rows="rows"
            :loading="pending"
            @inspect="inspect"
          />

          <orders-table
            v-else
            v-model:selected="selected"
            :rows="rows"
            :loading="pending"
            :per-page="perPage"
            @inspect="inspect"
          />
        </template>
      </div>

      <div
        v-if="!error && (pending || rows.length)"
        class="border-t border-line p-4 sm:px-5"
      >
        <LazyVPagination
          v-model:page="page"
          v-model:per-page="perPage"
          :total="data?.total ?? 0"
          :per-page-options="[10, 25, 50]"
          show-per-page
          item-label="requisitions"
          scroll-to="#ledger"
        />
      </div>
    </section>

    <!-- Ledger integrity strip -->
    <ul
      class="grid gap-x-6 gap-y-2 rounded-card border border-line bg-surface px-4 py-3 font-mono text-2xs text-mute sm:grid-cols-2 xl:grid-cols-4"
    >
      <li class="flex items-center gap-2">
        <span class="pip" aria-hidden="true" />SHA-256 block #8849-01 verified
      </li>
      <li class="flex items-center gap-2">
        <Icon name="lucide:database" size="12" aria-hidden="true" />Node:
        Cleanroom Lab A (synced 12ms)
      </li>
      <li class="flex items-center gap-2">
        <Icon name="lucide:gauge" size="12" aria-hidden="true" />Illuminant: D50
        (5000K ± 25K)
      </li>
      <li class="flex items-center gap-2 font-bold text-accent">
        <span class="status-dot" aria-hidden="true" />ISO 14644-1 class 4 active
      </li>
    </ul>

    <orders-bulk-bar
      :count="selected.length"
      @export="exportRows(selectedRows, 'csv')"
      @clear="selected = []"
    />

    <order-inspect-modal v-model:open="inspectOpen" :row="inspected" />

    <order-create-modal v-model:open="createOpen" @created="onCreated" />
  </div>
</template>

<script lang="ts" setup>
import type {
  OrderRow,
  OrderRange,
  OrderSort,
  OrdersResponse,
} from "~/types/admin/orders";
import type { ClientTier, EscrowMode, OrderStage } from "~/types/admin/orders";

definePageMeta({ layout: "admin" });

useSeoMeta({
  title: "PrintPro — Order Requisition & Escrow Ledger",
  description:
    "Chain-of-custody clearing house for optical systems, piezo print engines and archival substrates.",
});

const toast = useToast();

const filters = reactive({
  q: "",
  stage: "all" as "all" | OrderStage,
  escrow: "all" as "all" | EscrowMode,
  tier: "all" as "all" | ClientTier,
  range: "all" as OrderRange,
  sort: "newest" as OrderSort,
});
const view = ref<"table" | "kanban">("table");
const page = ref(1);
const perPage = ref(10);
const selected = ref<string[]>([]);

// Typing in the search box shouldn't hit the API on every keystroke.
const debouncedQ = refDebounced(toRef(filters, "q"), 300);

const query = computed(() => ({
  ...filters,
  q: debouncedQ.value,
  page: page.value,
  perPage: perPage.value,
}));

// lazy: the screen renders at once and the KPIs and table show their own skeletons.
const { data, pending, error, refresh } = useFetch<OrdersResponse>(
  "/api/admin/orders",
  {
    lazy: true,
    query,
  },
);

const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () =>
    !!debouncedQ.value ||
    filters.stage !== "all" ||
    filters.escrow !== "all" ||
    filters.tier !== "all" ||
    filters.range !== "all",
);

const resetFilters = () => {
  filters.q = "";
  filters.stage = "all";
  filters.escrow = "all";
  filters.tier = "all";
  filters.range = "all";
};

// Any change to what is listed starts again from page 1 with nothing selected.
watch(
  [
    debouncedQ,
    () => filters.stage,
    () => filters.escrow,
    () => filters.tier,
    () => filters.range,
    () => filters.sort,
    perPage,
  ],
  () => {
    page.value = 1;
  },
);
watch([page, query], () => {
  selected.value = [];
});

const selectedRows = computed(() =>
  rows.value.filter((r) => selected.value.includes(r.id)),
);

// --- Inspect / create ---
const inspected = ref<OrderRow | null>(null);
const inspectOpen = ref(false);
const inspect = (row: OrderRow) => {
  inspected.value = row;
  inspectOpen.value = true;
};

const createOpen = ref(false);
const onCreated = () => {
  // Show the new requisition at the top of the newest-first ledger.
  filters.sort = "newest";
  filters.stage = "all";
  page.value = 1;
  refresh();
};

// --- Export ---
const exportMenu = ref<HTMLElement | null>(null);
const exportOpen = ref(false);
onClickOutside(exportMenu, () => {
  exportOpen.value = false;
});

const download = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement("a"), {
    href: url,
    download: name,
  }).click();
  URL.revokeObjectURL(url);
};

const exportRows = (list: OrderRow[], format: "csv" | "json") => {
  exportOpen.value = false;
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no requisitions on this page.",
    });
    return;
  }
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") {
    download(
      `requisitions-${stamp}.json`,
      JSON.stringify(list, null, 2),
      "application/json",
    );
  } else {
    const cell = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
    const csv = [
      [
        "id",
        "placed_at_utc",
        "customer",
        "atelier",
        "allocation",
        "escrow_eur",
        "stage",
      ],
      ...list.map((r) => [
        r.id,
        r.placedAt,
        r.customer.name,
        r.customer.org,
        r.allocation.title,
        r.amount,
        r.stage,
      ]),
    ]
      .map((line) => line.map(cell).join(","))
      .join("\r\n");
    download(`requisitions-${stamp}.csv`, "﻿" + csv, "text/csv;charset=utf-8");
  }
  toast.success(
    `Exported ${list.length} requisition${list.length > 1 ? "s" : ""}`,
  );
};
</script>