<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('products_ui.title')"
      :description="$t('products_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('products_ui.title') }]"
    >
      <template #actions>
        <LazyVMenu :label="$t('btn.export_ledger')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >{{ $t('btn.export_ledger') }}</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows(rows, 'pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> {{ $t('common_ui.export_pdf') }}
          </button>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows(rows, 'excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            {{ $t('common_ui.export_excel') }}
          </button>
        </LazyVMenu>

        <LazyVButton icon="lucide:circle-plus" to="/products/new"
          >{{ $t('btn.add_new_product_sku') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <products-kpis :data="data" />

    <section class="card" :aria-label="$t('products_ui.title')">
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
            :title="$t('orders_ui.sync_failed_title')"
            :description="$t('common_ui.connection_error')"
            :eyebrow="$t('products_ui.eyebrow_sync_error')"
            :tag="$t('products_ui.tag_offline')"
            tag-tone="accent"
          >
            <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
              >{{ $t('btn.retry_sync') }}</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <div
          v-else-if="!pending && data && !rows.length && hasFilters"
          class="p-5"
        >
          <LazyVEmptyState
            :title="$t('common_ui.empty_title')"
            :description="$t('common_ui.empty_description')"
            :eyebrow="$t('products_ui.eyebrow_no_results')"
            :tag="$t('products_ui.tag_no_results')"
          >
            <LazyVButton variant="secondary" @click="resetFilters"
              >{{ $t('common_ui.clear_all_filters') }}</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <div v-else-if="!pending && data && !rows.length" class="p-5">
          <LazyVEmptyState
            bare
            icon="lucide:package"
            :title="$t('common_ui.empty_title')"
            :description="$t('products_ui.description')"
          >
          <LazyVButton icon="lucide:circle-plus" to="/products/new"
              >{{ $t('btn.add_new_product_sku') }}</LazyVButton
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
          :item-label="$t('products_ui.col_sku')"
          scroll-to="#register"
        />
      </div>
    </section>

    <LazyVBulkBar :count="selected.length" @clear="selected = []">
      <LazyVButton
        size="sm"
        icon="lucide:file-text"
        @click="exportRows(selectedRows, 'pdf')"
        >{{ $t('btn.export') }} PDF</LazyVButton
      >
      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:file-spreadsheet"
        @click="exportRows(selectedRows, 'excel')"
        >{{ $t('btn.export') }} Excel</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:trash-2"
        class="!border-accent !text-accent"
        @click="askDelete(selected, productsLabel(selected.length))"
        >{{ $t('btn.delete') }}</LazyVButton
      >
    </LazyVBulkBar>

        <LazyVDialog
      v-model:open="deleteOpen"
      :title="$t('products_ui.delete_title')"
      :description="
        pendingDelete
          ? $t('products_ui.delete_desc', { label: pendingDelete.label })
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
        {{ $t('products_ui.delete_warning') }}
      </p>
      <template #footer>
        <LazyVButton
          variant="secondary"
          :disabled="deleting"
          @click="deleteOpen = false"
          >{{ $t('btn.cancel') }}</LazyVButton
        >
        <LazyVButton
          :loading="deleting"
          icon="lucide:trash-2"
          @click="confirmDelete"
          >{{ $t('btn.delete') }}</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import { statusMeta } from "~/data/product-meta";
import type {
  Product,
  ProductCategory,
  ProductSort,
  ProductStatus,
  StockFilter,
} from "~/types/admin/products";

const { t } = useI18n();
const categories = useCategories();

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
const store = useProductsStore();
const { list: data, error } = storeToRefs(store);
const pending = computed(() => store.status === "pending");
const refresh = () => store.refresh();

watch(query, (q) => store.fetchList(q), { immediate: true });

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
    await store.adjustStock(p, next);
  } catch {
    toast.error(t("products_ui.stock_update_failed"), {
      description: t("products_ui.stock_reverted", { name: p.name, previous }),
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
    await store.removeMany(ids);
    toast.success(t("products_ui.removed_toast"), { description: label });
    selected.value = [];
    deleteOpen.value = false;
  } catch {
    toast.error(t("products_ui.delete_failed"), {
      description: t("products_ui.delete_failed_desc"),
    });
  } finally {
    deleting.value = false;
  }
};

// --- Export ---
const productsLabel = (n: number) =>
  t(n === 1 ? "products_ui.products_count_one" : "products_ui.products_count_other", { count: n });

const exportRows = async (list: Product[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning(t("products_ui.nothing_to_export"), {
      description: t("products_ui.nothing_to_export_desc"),
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: t("products_ui.export_title"),
      subtitle: productsLabel(list.length),
      fileName: `product-ledger-${new Date().toISOString().slice(0, 10)}`,
      head: [
        t("products_ui.col_sku"),
        t("products_ui.col_name"),
        t("products_ui.col_category"),
        t("products_ui.brand"),
        t("products_ui.price_egp"),
        t("products_ui.col_stock"),
        t("products_ui.reorder_at"),
        t("products_ui.col_status"),
      ],
      body: list.map((p) => [
        p.sku,
        p.name,
        categories.label(p.category),
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
      t("products_ui.exported_title", { label: productsLabel(list.length) }),
    );
  } catch {
    toast.error(t("products_ui.export_failed"), {
      description: t("products_ui.export_failed_desc"),
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t("products_ui.seo_title"),
  description: () => t("products_ui.seo_description"),
});
</script>