<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Discounts & Vouchers"
      description="Promotional vouchers and escrow concessions: values, usage caps, eligibility and schedules."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Coupons' }]"
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
        <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
          >Create new voucher</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <coupons-kpis :kpis="data?.kpis" />

    <div class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <section class="card min-w-0" aria-label="Voucher ledger">
        <div class="border-b border-line p-4 sm:p-5">
          <coupons-toolbar
            v-model:q="filters.q"
            v-model:tab="filters.tab"
            v-model:type="filters.type"
            v-model:tier="filters.tier"
            v-model:sort="filters.sort"
            :counts="data?.counts"
          />
        </div>

        <div id="vouchers" class="scroll-mt-24">
          <div v-if="error" class="p-5">
            <LazyVEmptyState
              icon="lucide:triangle-alert"
              title="Voucher ledger sync failed"
              description="The voucher ledger could not be reached. Your filters are kept, so retrying picks up where you left off."
              eyebrow="LEDGER :: SYNC_ERROR"
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
              title="No vouchers match these filters"
              description="Try a different code or campaign name, another type or tier, or the All vouchers tab."
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
              icon="lucide:ticket-percent"
              title="No vouchers yet"
              description="Create a voucher to give studios and institutions a discount, a freight subsidy or a lab credit."
              eyebrow="LEDGER :: EMPTY"
              tag="0 VOUCHERS"
            >
              <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
                >Create new voucher</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <coupons-list
            v-else
            v-model:selected="selected"
            :rows="rows"
            :loading="pending"
            :per-page="perPage"
            :selected-id="editing?.id ?? null"
            @select="openEdit"
            @duplicate="openDuplicate"
            @remove="(c) => askDelete([c.id], c.code)"
            @pause="(c) => runBulk([c.id], 'pause')"
            @resume="(c) => runBulk([c.id], 'resume')"
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
            item-label="vouchers"
            scroll-to="#vouchers"
          />
        </div>
      </section>

      <!-- Wide screens: the voucher form sits beside the ledger and stays in view -->
      <aside
        v-if="isWide"
        class="min-w-0 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto"
        aria-label="Voucher form"
      >
        <coupon-inspector
          v-if="panel"
          :key="panelKey"
          :coupon="panel.coupon"
          :seed="panel.seed"
          :saving="saving"
          :error="formError"
          @save="save"
          @remove="
            panel.coupon && askDelete([panel.coupon.id], panel.coupon.code)
          "
          @close="closePanel"
        />
        <LazyVEmptyState
          v-else
          bare
          icon="lucide:ticket-percent"
          title="Select a voucher"
          description="Choose a voucher to edit it, or create a new one."
        />
      </aside>
    </div>

    <!-- Narrower screens: the same form in a dialog -->
    <LazyVDialog
      v-model:open="dialogOpen"
      :title="panel?.coupon ? 'Edit voucher' : 'Create voucher'"
      size="lg"
    >
      <coupon-inspector
        v-if="panel"
        :key="panelKey"
        :coupon="panel.coupon"
        :seed="panel.seed"
        :saving="saving"
        :error="formError"
        @save="save"
        @remove="
          panel.coupon && askDelete([panel.coupon.id], panel.coupon.code)
        "
        @close="closePanel"
      />
    </LazyVDialog>

    <LazyVBulkBar :count="selected.length" @clear="selected = []">
      <LazyVButton
        size="sm"
        icon="lucide:pause"
        @click="runBulk(selected, 'pause')"
        >Pause</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:play"
        @click="runBulk(selected, 'resume')"
        >Resume</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:archive"
        @click="runBulk(selected, 'archive')"
        >Archive</LazyVButton
      >

      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:trash-2"
        class="!border-accent !text-accent"
        @click="askDelete(selected, `${selected.length} vouchers`)"
        >Delete</LazyVButton
      >
    </LazyVBulkBar>

    <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete voucher?"
      :description="
        pendingDelete ? `${pendingDelete.label} will be removed.` : ''
      "
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        Clients can no longer redeem it. Orders that already used it keep their
        concession. To stop a voucher without losing its history, pause or
        archive it instead. This cannot be undone from this screen.
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
import { stateMeta, typeMeta, valueLabel } from "~/data/coupon-meta";
import type {
  Coupon,
  CouponBulkAction,
  CouponInput,
  CouponRow,
  CouponSort,
  CouponTab,
  CouponTier,
  CouponType,
  CouponsResponse,
} from "~/types/admin/coupons";

const toast = useToast();
const { currency } = useFormatters();

const filters = reactive({
  q: "",
  tab: "all" as CouponTab,
  type: "all" as "all" | CouponType,
  tier: "all" as CouponTier,
  sort: "recent" as CouponSort,
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

// lazy: the screen renders at once; the cards and the ledger show their own skeletons.
const { data, pending, error, refresh } = useFetch<CouponsResponse>(
  "/api/admin/coupons",
  { lazy: true, query },
);

const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () =>
    !!debouncedQ.value ||
    filters.tab !== "all" ||
    filters.type !== "all" ||
    filters.tier !== "all",
);

const resetFilters = () => {
  filters.q = "";
  filters.tab = "all";
  filters.type = "all";
  filters.tier = "all";
};

// Any change to what is listed starts again from page 1 with nothing selected.
watch(
  [
    debouncedQ,
    () => filters.tab,
    () => filters.type,
    () => filters.tier,
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

// --- Voucher form: side panel on wide screens, dialog below ---
const isWide = useWideScreen();

// `coupon` is the voucher being edited, or null for a new one. A duplicate starts from a copy.
const panel = ref<{ coupon: Coupon | null; seed?: Coupon } | null>(null);
const editing = computed(() => panel.value?.coupon ?? null);
const formError = ref("");
const saving = ref(false);
let nonce = 0;
const panelKey = computed(
  () =>
    `${panel.value?.coupon?.id ?? (panel.value?.seed ? "copy" : "new")}-${nonce}`,
);

const dialogOpen = computed({
  get: () => !isWide.value && !!panel.value,
  set: (open) => {
    if (!open) closePanel();
  },
});

const open = (next: { coupon: Coupon | null; seed?: Coupon }) => {
  panel.value = next;
  formError.value = "";
  nonce++;
};
const openCreate = () => open({ coupon: null });
const openEdit = (c: CouponRow) => open({ coupon: c });
const closePanel = () => {
  panel.value = null;
  formError.value = "";
};

// A duplicate is a new voucher that begins with the original's settings and its own code.
const openDuplicate = (c: CouponRow) =>
  open({
    coupon: null,
    seed: {
      ...c,
      id: "",
      code: `${c.code}-COPY`.slice(0, 40),
      used: 0,
      status: "draft",
    },
  });

const save = async (values: CouponInput) => {
  saving.value = true;
  formError.value = "";
  const target = panel.value?.coupon;
  try {
    const saved = await $fetch<CouponRow>(
      target ? `/api/admin/coupons/${target.id}` : "/api/admin/coupons",
      {
        method: target ? "PATCH" : "POST",
        body: values,
      },
    );
    toast.success(target ? "Voucher updated" : "Voucher created", {
      description: saved.code,
    });
    if (!target) {
      // New vouchers show at the top of the recently modified list.
      resetFilters();
      filters.sort = "recent";
      page.value = 1;
    }
    await refresh();
    open({ coupon: saved });
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    formError.value =
      status === 409
        ? "Another voucher already uses that code. Choose a different one."
        : "The voucher could not be saved. Check the values and try again.";
  } finally {
    saving.value = false;
  }
};

// --- Pause, resume, archive (one or many) ---
const bulkWords: Record<Exclude<CouponBulkAction, "delete">, string> = {
  pause: "paused",
  resume: "resumed",
  archive: "archived",
};

const runBulk = async (
  ids: string[],
  action: Exclude<CouponBulkAction, "delete">,
) => {
  try {
    const { changed } = await $fetch<{ changed: number }>(
      "/api/admin/coupons/bulk",
      { method: "POST", body: { ids, action } },
    );
    if (changed)
      toast.success(
        `${changed} voucher${changed > 1 ? "s" : ""} ${bulkWords[action]}`,
      );
    else
      toast.warning("Nothing changed", {
        description:
          "Those vouchers can't be " +
          bulkWords[action] +
          " from their current state.",
      });
    selected.value = [];
    await refresh();
  } catch {
    toast.error("Couldn't update the vouchers", {
      description: "Nothing was changed. Try again.",
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
    await $fetch("/api/admin/coupons/bulk", {
      method: "POST",
      body: { ids, action: "delete" },
    });
    toast.success("Voucher deleted", { description: label });
    if (panel.value?.coupon && ids.includes(panel.value.coupon.id))
      closePanel();
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
const exportRows = async (list: CouponRow[], format: "pdf" | "excel") => {
  if (!list.length) {
    toast.warning("Nothing to export", {
      description: "There are no vouchers on this page.",
    });
    return;
  }
  const money = (n: number) => currency(n, { maximumFractionDigits: 0 });
  try {
    await downloadTable(format, {
      title: "Voucher ledger",
      subtitle: `${list.length} voucher${list.length > 1 ? "s" : ""}`,
      fileName: `voucher-ledger-${new Date().toISOString().slice(0, 10)}`,
      head: [
        "Code",
        "Campaign",
        "Type",
        "Discount",
        "Used",
        "Limit",
        "Min order",
        "Tier",
        "Starts",
        "Ends",
        "Status",
      ],
      body: list.map((c) => [
        c.code,
        c.campaign,
        typeMeta[c.type].short,
        valueLabel(c, money),
        c.used,
        c.limit ?? "Unlimited",
        c.minOrder,
        c.tier === "all" ? "All" : c.tier,
        c.startsAt ?? "",
        c.endsAt ?? "",
        stateMeta[c.state].label,
      ]),
      moneyCols: [6],
      numberCols: [4, 5],
    });
    toast.success(
      `Exported ${list.length} voucher${list.length > 1 ? "s" : ""}`,
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
  title: "Coupons",
  description:
    "Promotional vouchers and escrow concessions with usage caps and schedules.",
});
</script>