<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('categories_ui.title')"
      :description="$t('categories_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('categories_ui.title') }]"
    />

    <LazyVErrorBanner
      v-if="error"
      :message="$t('common_ui.connection_error')"
      @retry="() => refresh()"
    />

    <template v-else>
      <section class="card min-w-0" :aria-label="$t('categories_ui.tree_label')">
        <div class="border-b border-line p-4 sm:p-5">
          <categories-toolbar
            v-model:filter="filter"
            v-model:view="view"
            v-model:reorder-mode="reorderMode"
            @add="openAdd(null)"
            @expand="expandAll"
            @collapse="expanded = []"
          />
        </div>

        <category-tree
          v-model:expanded="expanded"
          :nodes="nodes"
          :filter="filter"
          :view="view"
          :selected-id="drawerOpen ? selectedId : null"
          :reorder-mode="reorderMode"
          :loading="pending && !data"
          @select="openEdit"
          @remove="askDelete"
          @visibility="setVisibility"
          @reorder="reorder"
        >
          <template #empty>
            <LazyVEmptyState
              bare
              :icon="filter ? 'lucide:search-x' : 'lucide:folder-tree'"
              :title="filter ? $t('categories_ui.empty_filter_title') : $t('categories_ui.empty_title')"
              :description="filter ? $t('categories_ui.empty_filter_desc') : $t('categories_ui.empty_desc')"
            >
              <LazyVButton
                v-if="filter"
                variant="secondary"
                @click="filter = ''"
                >{{ $t('categories_ui.btn_clear_filter') }}</LazyVButton
              >

              <LazyVButton
                v-else
                icon="lucide:circle-plus"
                @click="openAdd(null)"
                >{{ $t('categories_ui.btn_add_category') }}</LazyVButton
              >
            </LazyVEmptyState>
          </template>
        </category-tree>
      </section>
    </template>

    <!-- Category inspector: slides in from the end edge, like the notifications panel -->
    <Transition name="fade">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm"
        aria-hidden="true"
        @click="closeInspector"
      />
    </Transition>

    <aside
      id="category-drawer"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('categories_ui.inspector_title')"
      class="fixed inset-y-0 end-0 z-50 w-full max-w-xl overflow-y-auto overscroll-contain border-s border-line bg-surface shadow-2xl shadow-black/50 transition-[transform,visibility] duration-normal ease-out motion-reduce:transition-none [&>section]:min-h-full [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none"
      :class="
        drawerOpen
          ? 'visible translate-x-0'
          : 'invisible translate-x-full rtl:-translate-x-full'
      "
      :inert="drawerOpen ? undefined : ''"
      @keydown.esc="closeInspector"
    >
      <category-inspector
        v-if="inspector"
        :key="inspectorKey"
        :category="inspector.category"
        :new-parent-id="inspector.parentId"
        :masters="masters"
        :has-children="
          inspector.category ? hasChildren(inspector.category.id) : false
        "
        :saving="saving"
        :error="formError"
        @save="save"
        @remove="inspector.category && askDelete(inspector.category)"
        @close="closeInspector"
      />
    </aside>

    <LazyVDialog
      v-model:open="deleteOpen"
      :title="$t('categories_ui.delete_category_title')"
      :description="deleteTarget ? deleteTarget.name : ''"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span v-if="deleteTarget">{{ $t('categories_ui.delete_category_confirm') }}</span>
      </p>
      <p v-if="deleteError" class="callout-accent mt-3" role="alert">
        <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
        {{ deleteError }}
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
import type { Category, CategoryInput } from "~/types/admin/categories";

const toast = useToast();
const { t } = useI18n();
const { number } = useFormatters();

// lazy: the page renders at once; the KPIs and the tree show their own skeletons.
const store = useCategoriesStore();
const { data, error } = storeToRefs(store);
const pending = computed(() => store.status === "pending");
const refresh = () => store.refresh();
store.fetchAll();

const nodes = computed(() => data.value?.nodes ?? []);
const masters = computed(() =>
  nodes.value.filter((n) => !n.parentId).sort((a, b) => a.order - b.order),
);
const hasChildren = (id: string) => nodes.value.some((n) => n.parentId === id);

// --- View state ---
const filter = ref("");
const view = ref<"tree" | "flat">("tree");
const reorderMode = ref(false);
const expanded = ref<string[]>([]);

// Open the first few masters once the tree arrives.
const seeded = ref(false);
watch(
  nodes,
  (list) => {
    if (seeded.value || !list.length) return;
    seeded.value = true;
    expanded.value = list
      .filter((n) => !n.parentId)
      .sort((a, b) => a.order - b.order)
      .slice(0, 4)
      .map((n) => n.id);
  },
  { immediate: true },
);
const expandAll = () => {
  expanded.value = masters.value.map((m) => m.id);
};

// --- Inspector: a panel that slides in from the end edge ---
const drawerOpen = ref(false);
let opener: HTMLElement | null = null;

const selectedId = ref<string | null>(null);
const creating = ref<{ parentId: string | null } | null>(null);
const formError = ref("");
const saving = ref(false);
let nonce = 0;

const inspector = computed(() => {
  if (creating.value)
    return { category: null, parentId: creating.value.parentId };
  const category = nodes.value.find((n) => n.id === selectedId.value);
  return category ? { category, parentId: category.parentId } : null;
});
// A new key remounts the form with fresh values whenever the target changes.
const inspectorKey = computed(
  () => `${creating.value ? "new" : selectedId.value}-${nonce}`,
);

const showDrawer = async () => {
  if (!drawerOpen.value) opener = document.activeElement as HTMLElement | null;
  drawerOpen.value = true;
  await nextTick();
  document
    .querySelector<HTMLElement>("#category-drawer [data-close-btn]")
    ?.focus();
};

const openEdit = (id: string) => {
  creating.value = null;
  selectedId.value = id;
  formError.value = "";
  nonce++;
  showDrawer();
};
const openAdd = (parentId: string | null) => {
  selectedId.value = null;
  creating.value = { parentId };
  formError.value = "";
  nonce++;
  showDrawer();
  if (parentId && !expanded.value.includes(parentId))
    expanded.value = [...expanded.value, parentId];
};
// The form stays in place until the panel has slid out, then the selection is cleared.
const closeInspector = () => {
  if (!drawerOpen.value) return;
  drawerOpen.value = false;
  opener?.focus?.();
  opener = null;
  setTimeout(() => {
    if (drawerOpen.value) return;
    creating.value = null;
    selectedId.value = null;
    formError.value = "";
  }, 300);
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
watch(() => route.fullPath, closeInspector);

const save = async (values: CategoryInput) => {
  saving.value = true;
  formError.value = "";
  const editing = inspector.value?.category;
  try {
    const saved = editing
      ? await store.update(editing.id, values)
      : await store.create(values);
    toast.success(editing ? t('categories_ui.toast_updated') : t('categories_ui.toast_created'), {
      description: saved.name,
    });
    await refresh();
    // Saved: slide the panel away, whether this was a new category or an edit.
    closeInspector();
  } catch (e) {
    const status = statusOf(e);
    const keyMessage = fieldErrorsOf(e).key;
    formError.value = keyMessage
      ? t('categories_ui.err_key_prefix', { message: keyMessage })
      : status === 409
        ? t('categories_ui.err_slug_conflict')
        : t('categories_ui.err_save_failed');
  } finally {
    saving.value = false;
  }
};

const toInput = (c: Category): CategoryInput => ({
  name: c.name,
  slug: c.slug,
  parentId: c.parentId,
  visibility: c.visibility,
  abstract: c.abstract,
  megamenu: c.megamenu,
  publicIndexing: c.publicIndexing,
  facetRank: c.facetRank,
  defaultSort: c.defaultSort,
});

// --- Storefront switch: updates at once, rolls back if the save fails ---
const setVisibility = async (c: Category, on: boolean) => {
  try {
    await store.setVisibility(c, on, toInput(c));
    toast.success(
      on ? t('categories_ui.toast_visible') : t('categories_ui.toast_hidden'),
      { description: c.name },
    );
  } catch {
    toast.error(t('categories_ui.toast_visibility_error'), {
      description: t('categories_ui.toast_visibility_unchanged', { name: c.name }),
    });
  }
};

// --- Reorder: shows the new order straight away, restores it if saving fails ---
const reorder = async (parentId: string | null, ids: string[]) => {
  try {
    await store.reorder(parentId, ids);
  } catch {
    toast.error(t('categories_ui.toast_reorder_error'), {
      description: t('categories_ui.toast_reorder_error_desc'),
    });
  }
};

// --- Delete ---
const deleteOpen = ref(false);
const deleting = ref(false);
const deleteTarget = ref<Category | null>(null);
const deleteError = ref("");

const askDelete = (c: Category) => {
  deleteTarget.value = c;
  deleteError.value = "";
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  const target = deleteTarget.value;
  if (!target) return;
  deleting.value = true;
  deleteError.value = "";
  try {
    await store.remove(target.id);
    toast.success(t('categories_ui.toast_deleted'), { description: target.name });
    if (
      selectedId.value === target.id ||
      nodes.value.find((n) => n.id === selectedId.value)?.parentId === target.id
    )
      closeInspector();
    deleteOpen.value = false;
  } catch (e) {
    // 409: products or coupons still use it. The reason stays in the dialog so it can be read and acted on.
    deleteError.value = statusOf(e) === 409 ? messageOf(e) : t('categories_ui.err_delete_failed');
  } finally {
    deleting.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('categories_ui.seo_title'),
  description: () => t('categories_ui.seo_description'),
});
</script>