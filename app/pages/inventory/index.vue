<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Inventory Reserves & Stock Telemetry Ledger"
      description="Real-time tracking of medium-format optical assemblies, piezo print engines, master paper rolls and mineral pigment chemistry across the climate-controlled vaults."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Inventory' }]"
    >
      <template #actions>
        <LazyVButton
          variant="secondary"
          icon="lucide:arrow-right-left"
          @click="openAdjust(null)"
          >Stock adjustment / transfer</LazyVButton
        >

        <LazyVMenu label="Export ledger">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >Export ledger</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF ·
            this page
          </button>

          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            Excel · this page
          </button>
        </LazyVMenu>
        <LazyVButton
          variant="secondary"
          icon="lucide:circle-plus"
          @click="openItem(null)"
          >Add item</LazyVButton
        >
        <LazyVButton icon="lucide:package-plus" @click="receiveOpen = true"
          >Receive inbound consignment</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <inventory-kpis :kpis="data?.kpis" />

    <div class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section class="card min-w-0" aria-label="Inventory ledger">
        <div class="border-b border-line p-4 sm:p-5">
          <inventory-toolbar
            v-model:q="filters.q"
            v-model:category="filters.category"
            v-model:vault="filters.vault"
            v-model:filter="filters.filter"
            v-model:sort="filters.sort"
            :counts="data?.counts"
          />
        </div>

        <div id="ledger" class="scroll-mt-24">
          <div v-if="error" class="p-5">
            <LazyVEmptyState
              icon="lucide:triangle-alert"
              title="Ledger sync failed"
              description="The inventory ledger could not be reached. Your filters are kept, so retrying picks up where you left off."
              eyebrow="LEDGER :: SYNC_ERROR"
              tag="OFFLINE"
              tag-tone="accent"
            >
              <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
                >Retry sync</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <div v-else-if="!pending && data && !rows.length" class="p-5">
            <LazyVEmptyState
              title="No stock matches these filters"
              description="Try a different SKU or bin, another vault, or the All inventory tab."
              eyebrow="QUERY :: NO_RESULTS"
              tag="0 RESULTS"
            >
              <LazyVButton variant="secondary" @click="resetFilters"
                >Clear all filters</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <inventory-list
            v-else
            :rows="rows"
            :loading="pending"
            :per-page="perPage"
            @adjust="openAdjust"
            @edit="openItem"
            @remove="askDelete"
          />
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
            item-label="registered SKUs"
            scroll-to="#ledger"
          />
        </div>
      </section>

      <inventory-feed
        :movements="movements"
        @refresh="() => refreshMovements()"
      />
    </div>

    <inventory-stock-dialog
      v-model:open="adjustOpen"
      :item="adjustItem"
      @done="onChanged"
    />

    <inventory-receive-dialog v-model:open="receiveOpen" @done="onChanged" />
    <inventory-item-dialog
      v-model:open="itemOpen"
      :item="editItem"
      @done="onItemSaved"
    />

    <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete this item?"
      :description="deleteTarget ? deleteTarget.name : ''"
    >
      <p class="callout">
        <Icon name="lucide:triangle-alert" size="14" class="bullet-icon" aria-hidden="true" />
        <span v-if="deleteTarget">
          This removes {{ deleteTarget.sku }} and its {{ number(deleteTarget.stock) }} unit{{ deleteTarget.stock === 1 ? "" : "s" }}
          ({{ currency(deleteTarget.price * deleteTarget.stock, { maximumFractionDigits: 0 }) }}) from the register and the Products list.
          The removal is recorded in the movement ledger. It cannot be undone from this screen.
        </span>
      </p>
      <template #footer>
        <LazyVButton variant="secondary" :disabled="deleting" @click="deleteOpen = false">Keep</LazyVButton>
        <LazyVButton :loading="deleting" icon="lucide:trash-2" @click="confirmDelete">Delete</LazyVButton>
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { categoryMeta } from "~/data/product-meta";
import { vaultLabel } from "~/data/inventory-meta";
import type {
  InventoryFilter,
  InventoryItem,
  InventoryResponse,
  InventorySort,
  Movement,
  Vault,
} from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

const toast = useToast();
const { number, currency } = useFormatters();

const filters = reactive({
  q: "",
  category: "all" as "all" | ProductCategory,
  vault: "all" as "all" | Vault,
  filter: "all" as InventoryFilter,
  sort: "urgent" as InventorySort,
});
const page = ref(1);
const perPage = ref(10);

// Typing in the search box shouldn't hit the API on every keystroke.
const debouncedQ = refDebounced(toRef(filters, "q"), 300);

const query = computed(() => ({
  ...filters,
  q: debouncedQ.value,
  page: page.value,
  perPage: perPage.value,
}));

// lazy: the screen renders at once; the cards, ledger and feed show their own skeletons.
const { data, pending, error, refresh } = useFetch<InventoryResponse>(
  "/api/admin/inventory",
  {
    lazy: true,
    query,
  },
);
const { data: movements, refresh: refreshMovements } = useFetch<Movement[]>(
  "/api/admin/inventory/movements",
  {
    lazy: true,
    query: { limit: 8 },
  },
);

const rows = computed(() => data.value?.rows ?? []);

const resetFilters = () => {
  filters.q = "";
  filters.category = "all";
  filters.vault = "all";
  filters.filter = "all";
};

// Any change to what is listed starts again from page 1.
watch(
  [
    debouncedQ,
    () => filters.category,
    () => filters.vault,
    () => filters.filter,
    () => filters.sort,
    perPage,
  ],
  () => {
    page.value = 1;
  },
);

// --- Stock changes ---
const adjustOpen = ref(false);
const adjustItem = ref<InventoryItem | null>(null);
const receiveOpen = ref(false);

const openAdjust = (item: InventoryItem | null) => {
  adjustItem.value = item;
  adjustOpen.value = true;
};

const onChanged = () => {
  refresh();
  refreshMovements();
};

// --- Add, edit and delete ---
const itemOpen = ref(false);
const editItem = ref<InventoryItem | null>(null);

const openItem = (item: InventoryItem | null) => {
  editItem.value = item;
  itemOpen.value = true;
};

const onItemSaved = (_: InventoryItem, mode: "create" | "edit") => {
  if (mode === "create") {
    // A new item may not match the current filters, so show everything again.
    resetFilters();
    page.value = 1;
  }
  onChanged();
};

const deleteOpen = ref(false);
const deleting = ref(false);
const deleteTarget = ref<InventoryItem | null>(null);

const askDelete = (item: InventoryItem) => {
  deleteTarget.value = item;
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  const target = deleteTarget.value;
  if (!target) return;
  deleting.value = true;
  try {
    await $fetch(`/api/admin/inventory/items/${target.id}`, { method: "DELETE" });
    toast.success("Item deleted", { description: target.name });
    deleteOpen.value = false;
    onChanged();
  } catch {
    toast.error("Couldn't delete the item", { description: "Nothing was removed. Try again." });
  } finally {
    deleting.value = false;
  }
};

// --- Export ---
const exportRows = async (format: "pdf" | "excel") => {
  const list = rows.value;
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There is no stock on this page.",
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: "Inventory ledger",
      subtitle: `${list.length} SKU${list.length > 1 ? "s" : ""}`,
      fileName: `inventory-ledger-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "SKU",
        "Name",
        "Division",
        "Vault",
        "Bin",
        "Stock",
        "Reserved",
        "Available",
        "Reorder at",
        "Stock value",
      ],
      body: list.map((i) => [
        i.sku,
        i.name,
        categoryMeta[i.category].label,
        vaultLabel[i.vault],
        i.bin,
        i.stock,
        i.reserved,
        i.available,
        i.min,
        i.price * i.stock,
      ]),
      moneyCols: [9],
      numberCols: [5, 6, 7, 8],
    });
    toast.success(`Exported ${list.length} SKU${list.length > 1 ? "s" : ""}`);
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
  title: "Inventory",
  description:
    "Stock levels, vault locations and movement history for the whole catalog.",
});
</script>