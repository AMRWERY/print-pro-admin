<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Category Taxonomy & Metrology Hierarchy"
      description="Organise the catalog into master categories and sub-categories. Reorder them, control what shows on the storefront, and edit each node's URL and listing."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Categories' }]"
    />

    <categories-kpis :kpis="data?.kpis" />

    <LazyVErrorBanner
      v-if="error"
      message="The category tree could not be loaded. Check your connection and try again."
      @retry="() => refresh()"
    />

    <div
      v-else
      class="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]"
    >
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
          :selected-id="selectedId"
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

      <!-- Wide screens: the inspector sits beside the tree and stays in view -->
      <aside
        v-if="isWide"
        class="min-w-0 xl:sticky xl:top-24"
        aria-label="Category inspector"
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
        <LazyVEmptyState
          v-else
          bare
          icon="lucide:mouse-pointer-click"
          title="Select a category"
          description="Choose a node to inspect and edit it, or add a new category."
        />
      </aside>
    </div>

    <!-- Narrower screens: the same inspector in a dialog -->
    <LazyVDialog
      v-model:open="dialogOpen"
      :title="inspector?.category ? 'Edit category' : 'New category'"
      size="lg"
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
    </LazyVDialog>

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

// --- Inspector (side panel on wide screens, dialog below) ---
const isWide = useMediaQuery("(min-width: 1280px)");

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

const dialogOpen = computed({
  get: () => !isWide.value && !!inspector.value,
  set: (open) => {
    if (!open) closeInspector();
  },
});

const openEdit = (id: string) => {
  creating.value = null;
  selectedId.value = id;
  formError.value = "";
  nonce++;
};
const openAdd = (parentId: string | null) => {
  selectedId.value = null;
  creating.value = { parentId };
  formError.value = "";
  nonce++;
  if (parentId && !expanded.value.includes(parentId))
    expanded.value = [...expanded.value, parentId];
};
const closeInspector = () => {
  creating.value = null;
  selectedId.value = null;
  formError.value = "";
};

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