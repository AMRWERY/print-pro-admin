<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('customers_ui.title')"
      :description="$t('customers_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('customers_ui.title') }]"
    >
      <template #actions>
        <LazyVMenu :label="$t('btn.export_customers')">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >{{ $t('btn.export_customers') }}</LazyVButton
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

        <LazyVButton icon="lucide:user-plus" @click="openForm(null)"
          >{{ $t('btn.register_customer') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <customers-kpis :kpis="data?.kpis" />

    <section class="card min-w-0" :aria-label="$t('customers_ui.title')">
      <div class="border-b border-line p-4 sm:p-5">
        <customers-toolbar
          v-model:q="filters.q"
          v-model:segment="filters.segment"
          v-model:status="filters.status"
          v-model:activity="filters.activity"
          v-model:sort="filters.sort"
          :counts="data?.counts"
        />
      </div>

      <div id="registry" class="scroll-mt-24">
        <div v-if="error" class="p-5">
          <LazyVEmptyState
            icon="lucide:triangle-alert"
            :title="$t('common_ui.sync_error')"
            :description="$t('common_ui.connection_error')"
            :eyebrow="$t('customers_ui.sync_error_eyebrow')"
            :tag="$t('customers_ui.offline_tag')"
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
            :eyebrow="$t('customers_ui.no_results_eyebrow')"
            :tag="$t('customers_ui.zero_results_tag')"
          >
            <LazyVButton variant="secondary" @click="resetFilters"
              >{{ $t('common_ui.clear_all_filters') }}</LazyVButton
            >
          </LazyVEmptyState>
        </div>

        <div v-else-if="!pending && data && !rows.length" class="p-5">
          <LazyVEmptyState
            bare
            icon="lucide:users"
            :title="$t('common_ui.empty_title')"
            :description="$t('customers_ui.description')"
          />
        </div>

        <customers-list
          v-else
          v-model:selected="selected"
          :rows="rows"
          :loading="pending"
          :per-page="perPage"
          :selected-id="drawerOpen ? selectedId : null"
          @select="openInspector"
          @edit="openForm"
          @remove="(c) => askDelete([c.id], c.name)"
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
          :item-label="$t('customers_ui.title')"
          scroll-to="#registry"
        />
      </div>
    </section>

    <!-- Customer details: slides in from the end edge, like the notifications panel -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="closeDrawer"
      />
    </Transition>

    <aside
      id="customer-drawer"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('customers_ui.inspector_title')"
      class="fixed inset-y-0 end-0 z-50 w-full max-w-xl overflow-y-auto overscroll-contain border-s border-line bg-surface shadow-2xl shadow-black/50 transition-[transform,visibility] duration-normal ease-out motion-reduce:transition-none [&>section]:min-h-full [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none"
      :class="
        drawerOpen
          ? 'visible translate-x-0'
          : 'invisible translate-x-full rtl:-translate-x-full'
      "
      :inert="drawerOpen ? undefined : ''"
      @keydown.esc="closeDrawer"
    >
      <customer-inspector
        v-if="selectedId"
        ref="inspector"
        :key="selectedId"
        :id="selectedId"
        @edit="openForm"
        @remove="(c) => askDelete([c.id], c.name)"
        @close="closeDrawer"
      />
    </aside>

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
        @click="askDelete(selected, t('customers_ui.n_clients', { count: selected.length }))"
        >{{ $t('btn.delete') }}</LazyVButton
      >
    </LazyVBulkBar>

    <customer-form-dialog
      v-model:open="formOpen"
      :customer="formCustomer"
      @saved="onSaved"
    />

    <LazyVDialog
      v-model:open="deleteOpen"
      :title="$t('customers_ui.delete_title')"
      :description="
        pendingDelete
          ? $t('customers_ui.delete_desc', { label: pendingDelete.label })
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
        {{ $t('customers_ui.delete_warning') }}
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
import type {
  Customer,
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomerTier,
  CustomersResponse,
} from "~/types/admin/customers";

const { t } = useI18n();
const toast = useToast();

const segmentShort = computed<Record<CustomerSegment, string>>(() => ({
  enterprise: t("customers_ui.segment_short_enterprise"),
  business: t("customers_ui.segment_short_business"),
  printShop: t("customers_ui.segment_short_print_shop"),
  home: t("customers_ui.segment_short_home"),
  highLtv: t("customers_ui.segment_short_high_ltv"),
}));
const statusLabel = computed<Record<CustomerStatus, string>>(() => ({
  active: t("customers_ui.status_active"),
  audit: t("customers_ui.status_audit"),
  dormant: t("customers_ui.status_dormant"),
}));
const tierLabel = computed<Record<CustomerTier, string>>(() => ({
  AAA: t("customers_ui.tier_aaa"),
  AA: t("customers_ui.tier_aa"),
  A: t("customers_ui.tier_a"),
}));

const filters = reactive({
  q: "",
  segment: "all" as "all" | CustomerSegment,
  status: "all" as "all" | CustomerStatus,
  activity: "all" as CustomerActivity,
  sort: "spend" as CustomerSort,
});

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

// The screen renders at once; the cards and the registry show their own skeletons.
const store = useCustomersStore();
const { list: data, pending, error } = storeToRefs(store);
const refresh = () => store.refresh();
watch(query, (q) => store.fetchList(q), { immediate: true });

const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () =>
    !!debouncedQ.value ||
    filters.segment !== "all" ||
    filters.status !== "all" ||
    filters.activity !== "all",
);

const resetFilters = () => {
  filters.q = "";
  filters.segment = "all";
  filters.status = "all";
  filters.activity = "all";
};

// Any change to what is listed starts again from page 1 with nothing selected.
watch(
  [
    debouncedQ,
    () => filters.segment,
    () => filters.status,
    () => filters.activity,
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

// --- Dossier: a panel that slides in from the end edge ---
// The id stays after closing so the content doesn't vanish during the slide-out.
const selectedId = ref<string | null>(null);
const drawerOpen = ref(false);
const inspector = ref<{ refresh: () => void } | null>(null);

let opener: HTMLElement | null = null;

const openInspector = async (id: string) => {
  opener = document.activeElement as HTMLElement | null;
  selectedId.value = id;
  drawerOpen.value = true;
  await nextTick();
  document
    .querySelector<HTMLElement>(
      `#customer-drawer [aria-label='${t("common_ui.close_inspector")}']`,
    )
    ?.focus();
};

const closeDrawer = () => {
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  opener?.focus?.();
  opener = null;
};

// The page shouldn't scroll underneath the open panel, and navigating away closes it.
const scrollLock = useScrollLock(import.meta.client ? document.body : null);
watch(drawerOpen, (open) => {
  scrollLock.value = open;
});
onBeforeUnmount(() => {
  scrollLock.value = false;
});
const route = useRoute();
watch(() => route.fullPath, closeDrawer);

// --- Register / edit ---
const formOpen = ref(false);
const formCustomer = ref<Customer | null>(null);

const openForm = (customer: Customer | null) => {
  formCustomer.value = customer;
  formOpen.value = true;
};

const onSaved = (saved: Customer, mode: "create" | "edit") => {
  if (mode === "create") {
    // New clients show at the top of the newest list, and open straight away.
    resetFilters();
    filters.sort = "newest";
    page.value = 1;
    openInspector(saved.id);
  } else {
    inspector.value?.refresh();
  }
  refresh();
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
    await store.bulkDelete(ids);
    toast.success(t("customers_ui.toast_removed"), { description: label });
    if (selectedId.value && ids.includes(selectedId.value)) {
      closeDrawer();
      selectedId.value = null;
    }
    selected.value = [];
    deleteOpen.value = false;
    await refresh();
  } catch {
    toast.error(t("customers_ui.toast_delete_error"), {
      description: t("customers_ui.toast_delete_error_desc"),
    });
  } finally {
    deleting.value = false;
  }
};

// --- Export ---
const exportRows = async (list: Customer[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning(t("customers_ui.toast_nothing_export"), {
      description: t("customers_ui.toast_nothing_export_desc"),
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: t("customers_ui.export_title"),
      subtitle:
        list.length > 1
          ? t("customers_ui.n_clients", { count: list.length })
          : t("customers_ui.one_client"),
      fileName: `client-registry-${new Date().toISOString().slice(0, 10)}`,
      head: [
        t("common_ui.name"),
        t("customers_ui.organization"),
        t("customers_ui.export_col_role"),
        t("auth_ui.email_label"),
        t("profile_ui.phone"),
        t("customers_ui.export_col_region"),
        t("customers_ui.col_segment"),
        t("customers_ui.col_tier"),
        t("common_ui.status"),
        t("customers_ui.ltv_label"),
        t("customers_ui.col_orders"),
      ],
      body: list.map((c) => [
        c.name,
        c.org,
        c.role,
        c.email,
        c.phone,
        c.node,
        segmentShort.value[c.segment],
        tierLabel.value[c.tier],
        statusLabel.value[c.status],
        c.ltv,
        c.orders,
      ]),
      moneyCols: [9],
      numberCols: [10],
    });
    toast.success(
      list.length > 1
        ? t("customers_ui.toast_exported_many", { count: list.length })
        : t("customers_ui.toast_exported_one"),
    );
  } catch {
    toast.error(t("customers_ui.toast_file_error"), {
      description: t("customers_ui.try_again_moment"),
    });
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t("customers_ui.seo_title"),
  description: () => t("customers_ui.seo_description"),
});
</script>
