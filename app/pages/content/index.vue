<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Storefront Content & Banners"
      description="Hero and promotional banners, featured categories and products, brand sections and homepage offers: preview, schedule, publish and reorder."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Content' }]"
    >
      <template #actions>
        <LazyVButton
          variant="secondary"
          icon="lucide:zap"
          :loading="flushing"
          @click="flushCache"
          >Flush edge cache</LazyVButton
        >

        <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
          >Create content block</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <content-kpis :kpis="data?.kpis" />

    <div>
      <section class="card min-w-0" aria-label="Content blocks">
        <div class="border-b border-line p-4 sm:p-5">
          <content-toolbar
            v-model:q="filters.q"
            v-model:tab="filters.tab"
            v-model:state="filters.state"
            v-model:view="view"
            :counts="data?.counts"
          />
        </div>

        <div id="blocks" class="scroll-mt-24">
          <div v-if="error" class="p-5">
            <LazyVEmptyState
              icon="lucide:triangle-alert"
              title="Content could not be loaded"
              description="The content list could not be reached. Your filters are kept, so retrying picks up where you left off."
              eyebrow="CONTENT :: SYNC_ERROR"
              tag="OFFLINE"
              tag-tone="accent"
            >
              <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
                >Retry</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <div
            v-else-if="!pending && data && !rows.length && hasFilters"
            class="p-5"
          >
            <LazyVEmptyState
              title="No content matches these filters"
              description="Try another headline or link, a different content type, or the All modules tab."
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
              icon="lucide:panels-top-left"
              title="No content blocks yet"
              description="Create a banner, a featured category or a brand section to shape what visitors see on the storefront."
              eyebrow="CONTENT :: EMPTY"
              tag="0 BLOCKS"
            >
              <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
                >Create content block</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <content-list
            v-else
            :rows="rows"
            :loading="pending && !silent"
            :per-page="perPage"
            :view="view"
            :selected-id="drawerOpen ? (editing?.id ?? null) : null"
            @select="openEdit"
            @preview="openPreview"
            @duplicate="openDuplicate"
            @remove="askDelete"
            @toggle="setPublished"
            @reorder="reorder"
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
            :per-page-options="[8, 16, 32]"
            show-per-page
            item-label="blocks"
            scroll-to="#blocks"
          />
        </div>
      </section>
    </div>

    <!-- Content inspector: slides in from the end edge, like the notifications panel -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="closePanel"
      />
    </Transition>

    <aside
      id="content-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Slot inspector"
      class="fixed inset-y-0 end-0 z-50 w-full max-w-2xl overflow-y-auto overscroll-contain border-s border-line bg-surface shadow-2xl shadow-black/50 transition-[transform,visibility] duration-normal ease-out motion-reduce:transition-none [&>section]:min-h-full [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none"
      :class="
        drawerOpen
          ? 'visible translate-x-0'
          : 'invisible translate-x-full rtl:-translate-x-full'
      "
      :inert="drawerOpen ? undefined : ''"
      @keydown.esc="closePanel"
    >
      <content-inspector
        v-if="panel"
        :key="panelKey"
        :block="panel.block"
        :seed="panel.seed"
        :saving="saving"
        :error="formError"
        @save="save"
        @remove="
          panel.block && askDelete(panel.block)
        "
        @close="closePanel"
      />
    </aside>

    <!-- Full preview -->
    <LazyVDialog
      v-model:open="previewOpen"
      :title="previewing?.title ?? 'Preview'"
      :description="previewing ? kindMeta[previewing.kind].label : ''"
      size="xl"
    >
      <div v-if="previewing" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <LazyVSegmented
            v-model="previewDevice"
            label="Preview device"
            :options="deviceOptions"
          />

          <LazyVStatusBadge
            :tone="stateMeta[previewing.state].tone"
            :icon="stateMeta[previewing.state].icon"
            >{{ stateMeta[previewing.state].label }}</LazyVStatusBadge
          >
        </div>

        <div class="rounded-card bg-ink p-4">
          <content-preview
            :block="previewing"
            :device="previewDevice"
            :caption="`${deviceMeta[previewDevice].label} preview of ${previewing.title}`"
          />
        </div>

        <dl class="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="label-caps">Links to</dt>
            <dd class="break-all font-mono text-xs" dir="ltr">
              {{ previewing.link }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">Schedule (UTC)</dt>
            <dd class="text-xs">
              {{ windowLabel(previewing.startsAt, previewing.endsAt) }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">Performance</dt>
            <dd class="text-xs tabular-nums">
              {{
                previewing.views
                  ? `${number(previewing.views)} views · ${percent(previewing.ctr, 2)} CTR`
                  : "No traffic yet"
              }}
            </dd>
          </div>
        </dl>
      </div>
      <template #footer>
        <LazyVButton variant="secondary" @click="previewOpen = false"
          >Close</LazyVButton
        >

        <LazyVButton
          v-if="previewing"
          icon="lucide:pencil"
          @click="editFromPreview"
          >Edit block</LazyVButton
        >
      </template>
    </LazyVDialog>

    <LazyVDialog
      v-model:open="deleteOpen"
      title="Delete this content block?"
      :description="pendingDelete?.title ?? ''"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        It disappears from the storefront straight away and its performance
        history is removed. To hide it without losing it, unpublish it instead.
        This cannot be undone from this screen.
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
import {
  deviceMeta,
  deviceOptions,
  kindMeta,
  stateMeta,
  windowLabel,
} from "~/data/content-meta";
import type {
  BlockInput,
  BlockRow,
  BlockStatusFilter,
  BlockTab,
  BlocksResponse,
  ContentBlock,
  PreviewDevice,
} from "~/types/admin/content";

const toast = useToast();
const { number, percent } = useFormatters();

const filters = reactive({
  q: "",
  tab: "all" as BlockTab,
  state: "all" as BlockStatusFilter,
});

const view = ref<"list" | "grid">("list");
const page = ref(1);
const perPage = ref(8);

// Typing in the search box shouldn't hit the API on every keystroke.
const debouncedQ = refDebounced(toRef(filters, "q"), 300);

const query = computed(() => ({
  ...filters,
  q: debouncedQ.value,
  page: page.value,
  perPage: perPage.value,
}));

// lazy: the screen renders at once; the cards and the list show their own skeletons.
// deep: reordering updates the rows on screen before the server confirms.
const { data, pending, error, refresh } = useFetch<BlocksResponse>(
  "/api/admin/content",
  { lazy: true, deep: true, query },
);

const rows = computed(() => data.value?.rows ?? []);

const hasFilters = computed(
  () => !!debouncedQ.value || filters.tab !== "all" || filters.state !== "all",
);

const resetFilters = () => {
  filters.q = "";
  filters.tab = "all";
  filters.state = "all";
};

// After our own changes the rows stay on screen while the list refreshes; no skeleton flash.
const silent = ref(false);
const reload = async () => {
  silent.value = true;
  try {
    await refresh();
  } finally {
    silent.value = false;
  }
};

watch([debouncedQ, () => filters.tab, () => filters.state, perPage], () => {
  page.value = 1;
});

// --- Inspector: a panel that slides in from the end edge ---
const drawerOpen = ref(false);
let opener: HTMLElement | null = null;

// `block` is the block being edited, or null for a new one. A duplicate starts from a copy.
const panel = ref<{ block: ContentBlock | null; seed?: ContentBlock } | null>(
  null,
);
const editing = computed(() => panel.value?.block ?? null);
const formError = ref("");
const saving = ref(false);
let nonce = 0;
const panelKey = computed(
  () =>
    `${panel.value?.block?.id ?? (panel.value?.seed ? "copy" : "new")}-${nonce}`,
);

const open = async (next: { block: ContentBlock | null; seed?: ContentBlock }) => {
  panel.value = next;
  formError.value = "";
  nonce++;
  if (!drawerOpen.value) opener = document.activeElement as HTMLElement | null;
  drawerOpen.value = true;
  await nextTick();
  document
    .querySelector<HTMLElement>("#content-drawer [aria-label='Close']")
    ?.focus();
};
const openCreate = () => open({ block: null });
const openEdit = (b: BlockRow) => open({ block: b });
// The form stays in place until the panel has slid out, then it is cleared.
const closePanel = () => {
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  opener?.focus?.();
  opener = null;
  setTimeout(() => {
    if (drawerOpen.value) return;
    panel.value = null;
    formError.value = "";
  }, 300);
};

// The page shouldn't scroll underneath the open panel, and navigating away closes it.
const scrollLock = useScrollLock(import.meta.client ? document.body : null);
watch(drawerOpen, (isOpen) => {
  scrollLock.value = isOpen;
});
onBeforeUnmount(() => {
  scrollLock.value = false;
});
const route = useRoute();
watch(() => route.fullPath, closePanel);

// A duplicate is a new draft that begins with the original's content.
const openDuplicate = (b: BlockRow) =>
  open({
    block: null,
    seed: {
      ...b,
      id: "",
      title: `${b.title} (copy)`.slice(0, 120),
      status: "draft",
      views: 0,
      clicks: 0,
    },
  });

const save = async (values: BlockInput) => {
  saving.value = true;
  formError.value = "";
  const target = panel.value?.block;
  try {
    const saved = await $fetch<BlockRow>(
      target ? `/api/admin/content/${target.id}` : "/api/admin/content",
      { method: target ? "PATCH" : "POST", body: values },
    );
    toast.success(target ? "Content block updated" : "Content block created", {
      description: saved.title,
    });
    if (!target) {
      // New blocks go to the top of the list.
      resetFilters();
      page.value = 1;
    }
    await reload();
    open({ block: saved });
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    formError.value =
      status === 404
        ? "This block no longer exists. Close the form and refresh the list."
        : "The block could not be saved. Check the values and try again.";
  } finally {
    saving.value = false;
  }
};

// --- Publish / unpublish ---
const setPublished = async (b: BlockRow, publish: boolean) => {
  const status = publish ? "published" : "draft";
  const before = b.status;
  b.status = status; // the switch moves at once
  try {
    const saved = await $fetch<BlockRow>(`/api/admin/content/${b.id}/status`, {
      method: "POST",
      body: { status },
    });
    toast.success(publish ? "Published" : "Unpublished", {
      description:
        publish && saved.state === "scheduled"
          ? `${saved.title} goes live on ${windowLabel(saved.startsAt, null).replace("From ", "")}.`
          : saved.title,
    });
    await reload();
  } catch {
    b.status = before;
    toast.error("Couldn't change the status", {
      description: "Nothing was changed. Try again.",
    });
  }
};

// --- Reorder: the rows move at once; a failed save puts them back ---
const reorder = async (ids: string[]) => {
  if (!data.value) return;
  const byId = new Map(data.value.rows.map((r) => [r.id, r]));
  const positions = data.value.rows
    .map((r) => r.position)
    .sort((a, c) => a - c);
  const next = ids.map((id) => byId.get(id)!);
  next.forEach((r, i) => (r.position = positions[i]!));
  data.value.rows = next;
  try {
    await $fetch("/api/admin/content/reorder", {
      method: "POST",
      body: { ids },
    });
    toast.success("Order saved", {
      description: "The storefront follows the new sequence.",
    });
  } catch {
    toast.error("Couldn't save the order", {
      description: "The list was put back as it was.",
    });
    await reload();
  }
};

// --- Preview ---
const previewing = ref<BlockRow | null>(null);
const previewDevice = ref<PreviewDevice>("desktop");
const previewOpen = computed({
  get: () => !!previewing.value,
  set: (v) => {
    if (!v) previewing.value = null;
  },
});
const openPreview = (b: BlockRow) => {
  previewDevice.value = "desktop";
  previewing.value = b;
};
const editFromPreview = () => {
  const b = previewing.value;
  previewing.value = null;
  if (b) openEdit(b);
};

// --- Delete ---
const deleteOpen = ref(false);
const deleting = ref(false);
const pendingDelete = ref<ContentBlock | null>(null);

const askDelete = (b: ContentBlock) => {
  pendingDelete.value = b;
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  const b = pendingDelete.value;
  if (!b) return;
  deleting.value = true;
  try {
    await $fetch(`/api/admin/content/${b.id}`, { method: "DELETE" });
    toast.success("Content block deleted", { description: b.title });
    if (panel.value?.block?.id === b.id) closePanel();
    deleteOpen.value = false;
    await reload();
  } catch {
    toast.error("Couldn't delete", {
      description: "Nothing was removed. Try again.",
    });
  } finally {
    deleting.value = false;
  }
};

// --- Edge cache ---
const flushing = ref(false);
const flushCache = async () => {
  flushing.value = true;
  try {
    await $fetch("/api/admin/content/flush", { method: "POST" });
    toast.success("Edge cache flushed", {
      description: "Visitors see the latest content within a minute.",
    });
  } catch {
    toast.error("Couldn't flush the cache", {
      description: "Try again in a moment.",
    });
  } finally {
    flushing.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Content / Banners",
  description:
    "Manage homepage banners, featured categories and products, and brand sections.",
});
</script>