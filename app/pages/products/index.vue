<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Equipment & Substrate Metrology"
      description="Precision inventory verification, MTF optical status, roll tension metrics and pigment batches for the ISO 5 cleanroom."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Products' }]"
    >
      <template #actions>
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
            @click="exportRows(rows, 'pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> PDF ·
            this page
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

        <LazyVButton icon="lucide:circle-plus" to="/products/new"
          >Add new product / SKU</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <products-kpis :data="data" />

    <section class="card" aria-label="Product register">
      <div class="p-4 sm:p-5">
        <products-toolbar
          v-model:q="filters.q"
          v-model:category="filters.category"
          v-model:brand="filters.brand"
          v-model:stock="filters.stock"
          v-model:status="filters.status"
          v-model:sort="filters.sort"
          v-model:view="view"
          :presets="data?.presets"
          :brands="data?.brands"
        />
      </div>

      <div id="register" class="scroll-mt-24 border-t border-line">
        <div v-if="error" class="p-5">
          <LazyVEmptyState
            icon="lucide:triangle-alert"
            title="Register sync failed"
            description="The product register could not be reached. Your filters are kept, so retrying picks up where you left off."
            eyebrow="REGISTER :: SYNC_ERROR"
            tag="OFFLINE"
            tag-tone="accent"
          >
            <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
              >Retry sync</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <div
          v-else-if="!pending && data && !rows.length && hasFilters"
          class="p-5"
        >
          <LazyVEmptyState
            title="No products match these filters"
            description="Try a different name or SKU, or clear the category, stock and status filters."
            eyebrow="QUERY :: NO_RESULTS"
            tag="0 RESULTS"
          >
            <LazyVButton variant="secondary" @click="resetFilters"
              >Clear all filters</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <div v-else-if="!pending && data && !rows.length" class="p-5">
          <LazyVEmptyState
            icon="lucide:package"
            title="The register is empty"
            description="Add your first product or SKU to start tracking stock, valuation and metrology status."
            eyebrow="REGISTER :: EMPTY"
            tag="0 SKUS"
          >
            <LazyVButton icon="lucide:circle-plus" to="/products/new"
              >Add new product / SKU</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <products-list
          v-else
          v-model:selected="selected"
          :rows="rows"
          :loading="pending"
          :per-page="perPage"
          :view="view"
          @edit="(p) => navigateTo(localePath(`/products/${p.id}`))"
          @duplicate="(p) => navigateTo(localePath({ path: '/products/new', query: { from: p.id } }))"
          @remove="(p) => askDelete([p.id], p.name)"
          @stock="adjustStock"
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
          scroll-to="#register"
        />
      </div>
    </section>

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

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:trash-2"
        class="!border-accent !text-accent"
        @click="askDelete(selected, `${selected.length} products`)"
        >Delete selected</LazyVButton
      >
    </LazyVBulkBar>

        <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete from the register?"
      :description="
        pendingDelete
          ? `${pendingDelete.label} will be removed from the register.`
          : ''
      "
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        This removes the SKU and its stock record. Existing orders keep their
        history. It cannot be undone from this screen.
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="deleting"
          @click="deleteOpen = false"
          >Keep</LazyVButton
        >
        <LazyVButton
          :loading="deleting"
          icon="lucide:trash-2"
          @click="confirmDelete"
          >Delete</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { categoryMeta, statusMeta } from "~/data/product-meta";
import type {
  Product,
  ProductCategory,
  ProductSort,
  ProductStatus,
  ProductsResponse,
  StockFilter,
} from "~/types/admin/products";

const toast = useToast();
const localePath = useLocalePath();

const filters = reactive({
  q: "",
  category: "all" as "all" | ProductCategory,
  brand: "all",
  stock: "all" as StockFilter,
  status: "all" as "all" | ProductStatus,
  sort: "newest" as ProductSort,
});
const view = ref<"ledger" | "cards">("ledger");
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

// lazy: the screen renders at once; the KPIs and the register show their own skeletons.
const { data, pending, error, refresh } = useFetch<ProductsResponse>(
  "/api/admin/products",
  {
    lazy: true,
    query,
  },
);

const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () =>
    !!debouncedQ.value ||
    filters.category !== "all" ||
    filters.brand !== "all" ||
    filters.stock !== "all" ||
    filters.status !== "all",
);

const resetFilters = () => {
  filters.q = "";
  filters.category = "all";
  filters.brand = "all";
  filters.stock = "all";
  filters.status = "all";
};

// Any change to what is listed starts again from page 1 with nothing selected.
watch(
  [
    debouncedQ,
    () => filters.category,
    () => filters.brand,
    () => filters.stock,
    () => filters.status,
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

// --- Quick stock adjustment (the + / − on cards) ---
// Updates the row at once and rolls back if the save fails. The KPI cards catch up on the next load.
const adjustStock = async (p: Product, next: number) => {
  if (next < 0) return;
  const previous = p.stock;
  p.stock = next;
  try {
    await $fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      body: { stock: next },
    });
  } catch {
    p.stock = previous;
    toast.error("Couldn't update stock", {
      description: `${p.name} is back to ${previous}.`,
    });
  }
};

// --- Delete (one or many) ---
const deleteOpen = ref(false);
const deleting = ref(false);
const pendingDelete = ref<{ ids: string[]; label: string } | null>(null);

const askDelete = (ids: string[], label: string) => {
  pendingDelete.value = { ids, label };
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!pendingDelete.value) return;
  deleting.value = true;
  try {
    const { ids, label } = pendingDelete.value;
    await $fetch("/api/admin/products/bulk-delete", {
      method: "POST",
      body: { ids },
    });
    toast.success("Removed from the register", { description: label });
    selected.value = [];
    deleteOpen.value = false;
    await refresh();
  } catch {
    toast.error("Couldn't delete", {
      description: "Nothing was removed. Try again.",
    });
  } finally {
    deleting.value = false;
  }
};

// --- Export ---
const exportRows = async (list: Product[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no products on this page.",
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: "Product ledger",
      subtitle: `${list.length} product${list.length > 1 ? "s" : ""}`,
      fileName: `product-ledger-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "SKU",
        "EAN",
        "Name",
        "Category",
        "Brand",
        "Price (EUR)",
        "Stock",
        "Reorder at",
        "Status",
      ],
      body: list.map((p) => [
        p.sku,
        p.ean,
        p.name,
        categoryMeta[p.category].label,
        p.brand,
        p.price,
        p.stock,
        p.min,
        statusMeta[p.status].label,
      ]),
      moneyCols: [5],
      numberCols: [6, 7],
    });
    toast.success(
      `Exported ${list.length} product${list.length > 1 ? "s" : ""}`,
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
  title: "Products",
  description:
    "Catalog, stock levels and metrology status for cameras, lenses, printers and print supplies.",
});
</script>