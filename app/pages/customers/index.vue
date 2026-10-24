<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Customer Accounts & Registries"
      description="Directory of businesses, schools, print shops and home offices: contact details, payment standing and order history."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Customers' }]"
    >
      <template #actions>
        <LazyVMenu label="Export customers">
          <template #trigger="{ attrs, toggle }">
            <LazyVButton
              v-bind="attrs"
              variant="secondary"
              icon="lucide:download"
              icon-end="lucide:chevron-down"
              @click="toggle"
              >Export customers</LazyVButton
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
        
        <LazyVButton icon="lucide:user-plus" @click="openForm(null)"
          >Register customer</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <customers-kpis :kpis="data?.kpis" />

      <section class="card min-w-0" aria-label="Client registry">
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
              title="Registry sync failed"
              description="The client registry could not be reached. Your filters are kept, so retrying picks up where you left off."
              eyebrow="REGISTRY :: SYNC_ERROR"
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
              title="No clients match these filters"
              description="Try a different name or email, another segment or status, or a wider activity window."
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
              icon="lucide:users"
              title="No clients registered yet"
              description="Register your first business, school or print shop to start building the directory."
              eyebrow="REGISTRY :: EMPTY"
              tag="0 CLIENTS"
            >
              <LazyVButton icon="lucide:user-plus" @click="openForm(null)"
                >Register customer</LazyVButton
              >
            </LazyVEmptyState>
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
            item-label="registered customers"
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
      aria-label="Customer details"
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
        @click="askDelete(selected, `${selected.length} clients`)"
        >Delete selected</LazyVButton
      >
    </LazyVBulkBar>

    <customer-form-dialog
      v-model:open="formOpen"
      :customer="formCustomer"
      @saved="onSaved"
    />

    <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete from the registry?"
      :description="
        pendingDelete
          ? `${pendingDelete.label} will be removed from the registry.`
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
        This removes the customer record and its notes. Past orders keep
        their history. It cannot be undone from this screen.
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
import { segmentMeta, statusMeta, tierMeta } from "~/data/customer-meta";
import type {
  Customer,
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomersResponse,
} from "~/types/admin/customers";

const toast = useToast();

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

// lazy: the screen renders at once; the cards and the registry show their own skeletons.
const { data, pending, error, refresh } = useFetch<CustomersResponse>(
  "/api/admin/customers",
  { lazy: true, query },
);

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
    .querySelector<HTMLElement>("#customer-drawer [aria-label='Close inspector']")
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
    await $fetch("/api/admin/customers/bulk-delete", {
      method: "POST",
      body: { ids },
    });
    toast.success("Removed from the registry", { description: label });
    if (selectedId.value && ids.includes(selectedId.value)) {
      closeDrawer();
      selectedId.value = null;
    }
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
const exportRows = async (list: Customer[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no clients on this page.",
    });
    return;
  }
  try {
    await downloadTable(format, {
      title: "Client registry",
      subtitle: `${list.length} client${list.length > 1 ? "s" : ""}`,
      fileName: `client-registry-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "Name",
        "Organization",
        "Role",
        "Email",
        "Phone",
        "Region",
        "Segment",
        "Tier",
        "Status",
        "Lifetime value",
        "Orders",
      ],
      body: list.map((c) => [
        c.name,
        c.org,
        c.role,
        c.email,
        c.phone,
        c.node,
        segmentMeta[c.segment].short,
        tierMeta[c.tier].label,
        statusMeta[c.status].label,
        c.ltv,
        c.orders,
      ]),
      moneyCols: [9],
      numberCols: [10],
    });
    toast.success(
      `Exported ${list.length} client${list.length > 1 ? "s" : ""}`,
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
  title: "Customers",
  description:
    "Customer directory: contact details, payment standing and order history.",
});
</script>