<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('content_ui.title')"
      :description="$t('content_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('nav.content') }]"
    >
      <template #actions>
        <LazyVButton
          variant="secondary"
          icon="lucide:zap"
          :loading="flushing"
          @click="flushCache"
          >{{ $t('btn.flush_cache') }}</LazyVButton
        >

        <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
          >{{ $t('btn.create_content_block') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <div>
      <section class="card min-w-0" :aria-label="$t('content_ui.section_label')">
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
              :title="$t('content_ui.error_title')"
              :description="$t('content_ui.error_desc')"
              :eyebrow="$t('content_ui.eyebrow_sync_error')"
              :tag="$t('content_ui.tag_offline')"
              tag-tone="accent"
            >
              <LazyVButton icon="lucide:refresh-cw" @click="() => refresh()"
                >{{ $t('btn.retry') }}</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <div
            v-else-if="!pending && data && !rows.length && hasFilters"
            class="p-5"
          >
            <LazyVEmptyState
              :title="$t('content_ui.empty_filter_title')"
              :description="$t('content_ui.empty_filter_desc')"
              :eyebrow="$t('content_ui.eyebrow_no_results')"
              :tag="$t('content_ui.tag_results_count', { count: 0 })"
            >
              <LazyVButton variant="secondary" @click="resetFilters"
                >{{ $t('common_ui.clear_all_filters') }}</LazyVButton
              >
            </LazyVEmptyState>
          </div>

          <div v-else-if="!pending && data && !rows.length" class="p-5">
            <LazyVEmptyState
            bare
              icon="lucide:panels-top-left"
              :title="$t('content_ui.empty_title')"
              :description="$t('content_ui.empty_desc')"
            >
              <LazyVButton icon="lucide:circle-plus" @click="openCreate()"
                >{{ $t('btn.create_content_block') }}</LazyVButton
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
            :item-label="$t('content_ui.item_label')"
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
      :aria-label="$t('content_ui.insp_slot_title')"
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

    <LazyVDialog
      v-model:open="previewOpen"
      :title="previewing?.title ?? $t('common_ui.view')"
      :description="previewing ? kindMeta[previewing.kind].label : ''"
      size="xl"
    >
      <div v-if="previewing" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <LazyVSegmented
            v-model="previewDevice"
            :label="$t('content_ui.preview_label')"
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
            :caption="
              $t('content_ui.insp_preview_caption', {
                device: deviceMeta[previewDevice].label,
                title: previewing.title,
              })
            "
          />
        </div>

        <dl class="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt class="label-caps">{{ $t('content_ui.preview_links_to') }}</dt>
            <dd class="break-all font-mono text-xs" dir="ltr">
              {{ previewing.link }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('content_ui.preview_schedule') }}</dt>
            <dd class="text-xs">
              {{ windowLabel(previewing.startsAt, previewing.endsAt) }}
            </dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('content_ui.preview_performance') }}</dt>
            <dd class="text-xs tabular-nums">
              {{
                previewing.views
                  ? $t('content_ui.list_views_ctr', {
                      views: number(previewing.views),
                      ctr: percent(previewing.ctr, 2),
                    })
                  : $t('content_ui.preview_no_traffic')
              }}
            </dd>
          </div>
        </dl>
      </div>
      <template #footer>
        <LazyVButton variant="secondary" @click="previewOpen = false"
          >{{ $t('btn.close') }}</LazyVButton
        >

        <LazyVButton
          v-if="previewing"
          icon="lucide:pencil"
          @click="editFromPreview"
          >{{ $t('content_ui.preview_edit_block') }}</LazyVButton
        >
      </template>
    </LazyVDialog>

    <LazyVDialog
      v-model:open="deleteOpen"
      :title="$t('content_ui.delete_block_title')"
      :description="pendingDelete?.title ?? ''"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ $t('content_ui.delete_block_body') }}
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
  ContentBlock,
  PreviewDevice,
} from "~/types/admin/content";

const toast = useToast();
const { t } = useI18n();
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

// The screen renders at once; the cards and the list show their own skeletons.
// Reordering updates the rows on screen (in the store) before the server confirms.
const store = useContentStore();
const { data, pending, error } = storeToRefs(store);
const refresh = () => store.refresh();
watch(query, (q) => store.fetchList(q), { immediate: true });

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
    .querySelector<HTMLElement>("#content-drawer [data-close-btn]")
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
      title: t("content_ui.copy_title", { title: b.title }).slice(0, 120),
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
    const saved = await store.save(target ? target.id : null, values);
    toast.success(target ? t('content_ui.toast_block_updated') : t('content_ui.toast_block_created'), {
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
    const status = statusOf(e);
    formError.value =
      status === 404
        ? t("content_ui.err_block_missing")
        : t("content_ui.err_save_failed");
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
    const saved = await store.setStatus(b.id, status);
    toast.success(publish ? t('content_ui.toast_published') : t('content_ui.toast_unpublished'), {
      description:
        publish && saved.state === "scheduled"
          ? t("content_ui.toast_goes_live", {
              title: saved.title,
              date: windowLabel(saved.startsAt, null).replace("From ", ""),
            })
          : saved.title,
    });
    await reload();
  } catch {
    b.status = before;
    toast.error(t('content_ui.toast_status_error'), {
      description: t('common_ui.try_again'),
    });
  }
};

// --- Reorder: the rows move at once; a failed save puts them back ---
const reorder = async (ids: string[]) => {
  if (!data.value) return;
  try {
    await store.reorder(ids);
    toast.success(t('content_ui.toast_order_saved'), {
      description: t('content_ui.toast_order_saved_desc'),
    });
  } catch {
    toast.error(t('content_ui.toast_order_error'), {
      description: t('content_ui.toast_order_error_desc'),
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
    await store.remove(b.id);
    toast.success(t('content_ui.toast_block_deleted'), { description: b.title });
    if (panel.value?.block?.id === b.id) closePanel();
    deleteOpen.value = false;
    await reload();
  } catch {
    toast.error(t('content_ui.toast_delete_error'), {
      description: t('common_ui.try_again'),
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
    await store.flush();
    toast.success(t('content_ui.toast_cache_flushed'), {
      description: t('content_ui.toast_cache_flushed_desc'),
    });
  } catch {
    toast.error(t('content_ui.toast_cache_error'), {
      description: t('common_ui.try_again'),
    });
  } finally {
    flushing.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('content_ui.seo_title'),
  description: () => t('content_ui.seo_description'),
});
</script>