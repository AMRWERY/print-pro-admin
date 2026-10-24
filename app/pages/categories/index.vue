<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Categories"
      description="Organise the catalog into master categories and sub-categories. Reorder them, control what shows on the storefront, and edit each node's URL and listing."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Categories' }]"
    />

    <categories-kpis :kpis="data?.kpis" />

    <LazyVErrorBanner
      v-if="error"
      message="The category tree could not be loaded. Check your connection and try again."
      @retry="() => refresh()"
    />

    <template v-else>
      <section class="card min-w-0" aria-label="Category tree">
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
          @add-child="openAdd"
          @remove="askDelete"
          @visibility="setVisibility"
          @reorder="reorder"
        >
          <template #empty>
            <LazyVEmptyState
              bare
              :icon="filter ? 'lucide:search-x' : 'lucide:folder-tree'"
              :title="
                filter ? 'No categories match this filter' : 'No categories yet'
              "
              :description="
                filter
                  ? 'Try a different name, slug or code.'
                  : 'Add your first master category to start organising the catalog.'
              "
            >
              <LazyVButton
                v-if="filter"
                variant="secondary"
                @click="filter = ''"
                >Clear filter</LazyVButton
              >

              <LazyVButton
                v-else
                icon="lucide:circle-plus"
                @click="openAdd(null)"
                >Add category</LazyVButton
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
      aria-label="Category inspector"
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
      title="Delete this category?"
      :description="deleteTarget ? deleteTarget.name : ''"
    >
      <p class="callout">
        <Icon
          name="lucide:triangle-alert"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span v-if="deleteTarget">
          This removes the category<span v-if="deleteChildren">
            and its {{ deleteChildren }} sub-categor{{
              deleteChildren === 1 ? "y" : "ies"
            }}</span
          >
          from the storefront tree. {{ number(deleteTarget.skus) }} SKU{{
            deleteTarget.skus === 1 ? "" : "s"
          }}
          will lose this category. Products themselves are not deleted. This
          cannot be undone from this screen.
        </span>
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
import type {
  CategoriesResponse,
  Category,
  CategoryInput,
} from "~/types/admin/categories";

const toast = useToast();
const { number } = useFormatters();

// lazy: the page renders at once; the KPIs and the tree show their own skeletons.
const { data, pending, error, refresh } = useFetch<CategoriesResponse>(
  "/api/admin/categories",
  { lazy: true, deep: true },
);

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
    .querySelector<HTMLElement>("#category-drawer [aria-label='Close inspector']")
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
    const saved = await $fetch<Category>(
      editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
      {
        method: editing ? "PATCH" : "POST",
        body: values,
      },
    );
    toast.success(editing ? "Category updated" : "Category created", {
      description: saved.name,
    });
    await refresh();
    creating.value = null;
    selectedId.value = saved.id;
    nonce++;
    if (saved.parentId && !expanded.value.includes(saved.parentId))
      expanded.value = [...expanded.value, saved.parentId];
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    formError.value =
      status === 409
        ? "Another category already uses that URL slug. Choose a different one."
        : "The category could not be saved. Check the details and try again.";
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
  const previous = c.visibility;
  c.visibility = on ? "active" : "hidden";
  try {
    await $fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      body: toInput(c),
    });
    toast.success(
      on ? "Visible on the storefront" : "Hidden from the storefront",
      { description: c.name },
    );
    refresh();
  } catch {
    c.visibility = previous;
    toast.error("Couldn't change visibility", {
      description: `${c.name} is unchanged.`,
    });
  }
};

// --- Reorder: shows the new order straight away, restores it if saving fails ---
const reorder = async (parentId: string | null, ids: string[]) => {
  const before = new Map(nodes.value.map((n) => [n.id, n.order]));
  ids.forEach((id, order) => {
    const n = nodes.value.find((x) => x.id === id);
    if (n) n.order = order;
  });
  try {
    await $fetch("/api/admin/categories/reorder", {
      method: "POST",
      body: { parentId, ids },
    });
  } catch {
    nodes.value.forEach((n) => {
      if (before.has(n.id)) n.order = before.get(n.id)!;
    });
    toast.error("Couldn't save the new order", {
      description: "The previous order was restored.",
    });
  }
};

// --- Delete ---
const deleteOpen = ref(false);
const deleting = ref(false);
const deleteTarget = ref<Category | null>(null);
const deleteChildren = computed(() =>
  deleteTarget.value
    ? nodes.value.filter((n) => n.parentId === deleteTarget.value!.id).length
    : 0,
);

const askDelete = (c: Category) => {
  deleteTarget.value = c;
  deleteOpen.value = true;
};

const confirmDelete = async () => {
  const target = deleteTarget.value;
  if (!target) return;
  deleting.value = true;
  try {
    await $fetch(`/api/admin/categories/${target.id}`, { method: "DELETE" });
    toast.success("Category deleted", { description: target.name });
    if (
      selectedId.value === target.id ||
      nodes.value.find((n) => n.id === selectedId.value)?.parentId === target.id
    )
      closeInspector();
    deleteOpen.value = false;
    await refresh();
  } catch {
    toast.error("Couldn't delete the category", {
      description: "Nothing was removed. Try again.",
    });
  } finally {
    deleting.value = false;
  }
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Categories",
  description: "Organise the catalog into categories and sub-categories.",
});
</script>