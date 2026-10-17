<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Order Requisition & Escrow Ledger"
      description="Authorized chain-of-custody transaction clearing house for optical systems, master-grade piezo print engines, and archival cotton substrates. Dual-signatory escrow protocols active."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Orders' }]"
    >
      <template #meta>
        <p class="chip" dir="ltr">STATION ID // CAL-902</p>
      </template>

      <template #actions>
        <LazyVMenu label="Export manifest">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >Export manifest</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows(rows, 'pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" />
            PDF · this page
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows(rows, 'excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel · this page
          </button>
        </LazyVMenu>

        <LazyVButton icon="lucide:circle-plus" @click="createOpen = true"
          >Create manual requisition</LazyVButton
        >
      </template>
    </LazyVPageHeader>

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

    <LazyVBulkBar :count="selected.length" @clear="selected = []">
      <LazyVButton
        size="sm"
        icon="lucide:file-text"
        @click="exportRows(selectedRows, 'pdf')"
        >Export PDF</LazyVButton
      >
      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:file-spreadsheet"
        @click="exportRows(selectedRows, 'excel')"
        >Export Excel</LazyVButton
      >
    </LazyVBulkBar>

    <order-inspect-modal v-model:open="inspectOpen" :row="inspected" />

    <order-create-modal v-model:open="createOpen" @created="onCreated" />
  </div>
</template>

<script lang="ts" setup>
import { stageMeta } from "~/data/order-meta";

import type {
  OrderRow,
  OrderRange,
  OrderSort,
  OrdersResponse,
} from "~/types/admin/orders";
import type { ClientTier, EscrowMode, OrderStage } from "~/types/admin/orders";

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

// "New order" on the dashboard links here with ?create=1.
const route = useRoute();

const createOpen = ref(route.query.create === "1");

const onCreated = () => {
  // Show the new requisition at the top of the newest-first ledger.
  filters.sort = "newest";
  filters.stage = "all";
  page.value = 1;
  refresh();
};

// --- Export ---
const exportRows = async (list: OrderRow[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no requisitions on this page.",
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: "Requisition ledger",
      subtitle: `${list.length} requisition${list.length > 1 ? "s" : ""}`,
      fileName: `requisitions-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "Requisition",
        "Placed (UTC)",
        "Customer",
        "Atelier",
        "Allocation",
        "Escrow (EGP)",
        "Stage",
      ],
      body: list.map((r) => [
        r.id,
        r.placedAt.slice(0, 16).replace("T", " "),
        r.customer.name,
        r.customer.org,
        r.allocation.title,
        r.amount,
        stageMeta[r.stage].tab,
      ]),
      moneyCols: [5],
    });
    toast.success(
      `Exported ${list.length} requisition${list.length > 1 ? "s" : ""}`,
    );
  } catch {
    toast.error("Couldn't create the file", {
      description: "Try again in a moment.",
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Order Requisition & Escrow Ledger",
  description:
    "Chain-of-custody clearing house for optical systems, piezo print engines and archival substrates.",
});
</script>