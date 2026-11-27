<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('inventory_ui.title')"
      :description="$t('inventory_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('inventory_ui.title') }]"
    >
      <template #actions>
        <LazyVButton
          variant="secondary"
          icon="lucide:arrow-right-left"
          @click="openAdjust(null)"
          >{{ $t('btn.stock_adjustment') }}</LazyVButton
        >

        <LazyVMenu :label="$t('common_ui.export_ledger')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >{{ $t('common_ui.export_ledger') }}</LazyVButton
            >
          </template>
          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('pdf')"
          >
            <Icon name="lucide:file-text" size="16" aria-hidden="true" /> {{ $t('inventory_ui.export_pdf_label') }}
          </button>

          <button
            type="button"
            role="menuitem"
            class="menu-item w-full"
            @click="exportRows('excel')"
          >
            <Icon name="lucide:file-spreadsheet" size="16" aria-hidden="true" />
            {{ $t('inventory_ui.export_excel_label') }}
          </button>
        </LazyVMenu>
        <LazyVButton
          variant="secondary"
          icon="lucide:circle-plus"
          @click="openItem(null)"
          >{{ $t('btn.add_item') }}</LazyVButton
        >
        <LazyVButton icon="lucide:package-plus" @click="receiveOpen = true"
          >{{ $t('btn.receive_inbound') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <inventory-kpis :kpis="data?.kpis" />

    <div class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section class="card min-w-0" :aria-label="$t('inventory_ui.ledger_title')">
        <div class="border-b border-line p-4 sm:p-5">
          <inventory-toolbar
            v-model:q="filters.q"
            v-model:category="filters.category"
            v-model:warehouse="filters.warehouse"
            v-model:filter="filters.filter"
            v-model:sort="filters.sort"
            :counts="data?.counts"
          />
        </div>

        <div id="ledger" class="scroll-mt-24">
          <div v-if="error" class="p-5">
            <LazyVEmptyState
              icon="lucide:triangle-alert"
              :title="$t('inventory_ui.error_title')"
              :description="$t('inventory_ui.error_desc')"
              :eyebrow="$t('inventory_ui.sync_error_eyebrow')"
              :tag="$t('inventory_ui.offline_tag')"
              tag-tone="accent"
            >
              <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
                >{{ $t('btn.retry_sync') }}</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <div v-else-if="!pending && data && !rows.length" class="p-5">
            <LazyVEmptyState
              bare
              :title="$t('inventory_ui.empty_filter_title')"
              :description="$t('inventory_ui.empty_filter_desc')"
            >
              <LazyVButton variant="secondary" @click="resetFilters"
                >{{ $t('common_ui.clear_all_filters') }}</LazyVButton
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
            @duplicate="(i) => openItem(i, true)"
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
            :item-label="$t('inventory_ui.item_label')"
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
      :copy="copyItem"
      @done="onItemSaved"
    />

    <LazyVDialog
      v-model:open="deleteOpen"
      :title="$t('inventory_ui.delete_item_title')"
      :description="deleteTarget ? deleteTarget.name : ''"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span v-if="deleteTarget">{{ $t('inventory_ui.delete_item_confirm') }}</span>
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
import { warehouseLabel } from "~/data/inventory-meta";
import type {
  InventoryFilter,
  InventoryItem,
  InventorySort,
  Warehouse,
} from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

const categories = useCategories();

const toast = useToast();
const { t } = useI18n();
const { number, currency } = useFormatters();

const filters = reactive({
  q: "",
  category: "all" as "all" | ProductCategory,
  warehouse: "all" as "all" | Warehouse,
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
const store = useInventoryStore();
const { list: data, error, movements } = storeToRefs(store);
const pending = computed(() => store.status === "pending");
const refresh = () => store.refresh();
const refreshMovements = () => store.fetchMovements();

watch(query, (q) => store.fetchList(q), { immediate: true });
store.fetchMovements();

const rows = computed(() => data.value?.rows ?? []);

const resetFilters = () => {
  filters.q = "";
  filters.category = "all";
  filters.warehouse = "all";
  filters.filter = "all";
};

// Any change to what is listed starts again from page 1.
watch(
  [
    debouncedQ,
    () => filters.category,
    () => filters.warehouse,
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
const copyItem = ref(false);

const openItem = (item: InventoryItem | null, copy = false) => {
  editItem.value = item;
  copyItem.value = copy;
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
    await store.removeItem(target.id);
    toast.success(t('inventory_ui.toast_item_deleted'), { description: target.name });
    deleteOpen.value = false;
    onChanged();
  } catch {
    toast.error(t('inventory_ui.toast_item_delete_error'), {
      description: t('common_ui.try_again'),
    });
  } finally {
    deleting.value = false;
  }
};

// --- Export ---
const exportRows = async (format: "pdf" | "excel") => {
  const list = rows.value;
  if (!list.length) {
    toast.warning(t('inventory_ui.toast_export_empty'), {
      description: t('inventory_ui.toast_export_empty_desc'),
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: t('inventory_ui.ledger_title'),
      subtitle: t('inventory_ui.export_subtitle', { n: list.length }),
      fileName: `inventory-ledger-${new Date().toISOString().slice(0, 10)}`,
      head: [
        t('inventory_ui.item_sku'),
        t('common_ui.name'),
        t('inventory_ui.item_division'),
        t('inventory_ui.warehouse'),
        t('inventory_ui.export_col_bin'),
        t('inventory_ui.col_stock'),
        t('inventory_ui.export_col_reserved'),
        t('inventory_ui.export_col_available'),
        t('inventory_ui.export_col_reorder_at'),
        t('inventory_ui.export_col_stock_value'),
      ],
      body: list.map((i) => [
        i.sku,
        i.name,
        categories.label(i.category),
        warehouseLabel[i.warehouse],
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
    toast.success(t('inventory_ui.toast_exported', { n: list.length }));
  } catch {
    toast.error(t('inventory_ui.toast_export_error'), {
      description: t('common_ui.try_again'),
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('inventory_ui.seo_title'),
  description: () => t('inventory_ui.seo_description'),
});
</script>