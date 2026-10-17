<template>
  <div :aria-busy="loading || undefined">
    <!-- Loading -->
    <ul v-if="loading" class="space-y-3 p-4 sm:p-5">
      <li v-for="n in 5" :key="n">
        <LazyVSkeletonLoader class="h-20" />
      </li>
    </ul>

    <!-- Hierarchy -->
    <ul v-else-if="view === 'tree'" class="space-y-3 p-4 sm:p-5">
      <li
        v-for="root in roots"
        :key="root.id"
        class="rounded-card border bg-ink transition-colors duration-fast"
        :class="[
          selectedId === root.id ? 'border-accent' : 'border-line',
          dropClass(root),
        ]"
        @dragover="onDragOver($event, root)"
        @drop="onDrop($event, root)"
      >
        <div class="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
          <span
            class="cursor-grab touch-none text-mute active:cursor-grabbing"
            draggable="true"
            title="Drag to reorder"
            @dragstart="onDragStart($event, root)"
            @dragend="reset"
          >
            <Icon name="lucide:grip-vertical" size="18" aria-hidden="true" />
          </span>

          <LazyVButton
            v-if="childrenOf(root.id).length"
            variant="icon"
            size="sm"
            :icon="
              isOpen(root.id) ? 'lucide:chevron-down' : 'lucide:chevron-right'
            "
            icon-class="rtl:-scale-x-100"
            :aria-expanded="isOpen(root.id)"
            :aria-label="`${isOpen(root.id) ? 'Collapse' : 'Expand'} ${root.name}`"
            @click="toggle(root.id)"
          />
          <span v-else class="w-9" aria-hidden="true" />

          <LazyVIconTile :icon="root.icon" />

          <div class="min-w-0 flex-1 basis-48">
            <p
              class="flex flex-wrap items-center gap-2 font-display text-base font-bold leading-snug"
            >
              {{ root.name }}
              <span class="chip">{{
                String(root.order + 1).padStart(2, "0")
              }}</span>
            </p>
            <p class="meta break-all" dir="ltr">
              {{ root.slug }} · {{ number(root.skus) }} SKUs
            </p>
            <p class="mt-0.5 flex items-center gap-1.5 font-mono text-2xs">
              <LazyVStatusBadge
                :tone="visibilityMeta[root.visibility].tone"
                :icon="visibilityMeta[root.visibility].icon"
                >{{ visibilityMeta[root.visibility].label }}</LazyVStatusBadge
              >
            </p>
          </div>

          <div class="ms-auto flex items-center gap-1.5">
            <template v-if="reorderMode">
              <LazyVButton
                variant="icon"
                size="sm"
                icon="lucide:arrow-up"
                :aria-label="`Move ${root.name} up`"
                :disabled="root.order === 0"
                @click="move(root, -1)"
              />

              <LazyVButton
                variant="icon"
                size="sm"
                icon="lucide:arrow-down"
                :aria-label="`Move ${root.name} down`"
                :disabled="root.order === roots.length - 1"
                @click="move(root, 1)"
              />
            </template>
            <LazyVSwitch
              :model-value="root.visibility === 'active'"
              :label="`Visible on the storefront: ${root.name}`"
              @update:model-value="(on) => emit('visibility', root, on)"
            />

            <LazyVRowActions
              :label="`Actions for ${root.name}`"
              @edit="emit('select', root.id)"
              @remove="emit('remove', root)"
            >
              <button type="button" role="menuitem" class="menu-item w-full" @click="emit('addChild', root.id)">
                <Icon name="lucide:folder-plus" size="16" aria-hidden="true" /> Add sub-category
              </button>
            </LazyVRowActions>
          </div>
        </div>

        <ul
          v-if="isOpen(root.id) && childrenOf(root.id).length"
          class="space-y-1.5 rounded-b-card border-t border-line bg-surface/40 p-3 ps-12"
        >
          <li
            v-for="child in childrenOf(root.id)"
            :key="child.id"
            class="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-control border bg-ink p-2.5 transition-colors duration-fast"
            :class="[
              selectedId === child.id ? 'border-accent' : 'border-line',
              dropClass(child),
            ]"
            @dragover="onDragOver($event, child)"
            @drop="onDrop($event, child)"
          >
            <span
              class="cursor-grab touch-none text-mute active:cursor-grabbing"
              draggable="true"
              title="Drag to reorder"
              @dragstart="onDragStart($event, child)"
              @dragend="reset"
            >
              <Icon name="lucide:grip-vertical" size="16" aria-hidden="true" />
            </span>
            <div class="min-w-0 flex-1 basis-48">
              <p class="text-sm font-medium">
                <span class="font-mono text-xs text-mute"
                  >{{ root.order + 1 }}.{{ child.order + 1 }} //</span
                >
                {{ child.name }}
              </p>
              <p class="meta break-all" dir="ltr">{{ child.slug }}</p>
            </div>
            <span class="font-mono text-xs tabular-nums text-mute"
              >{{ number(child.skus) }} SKUs</span
            >
            <LazyVStatusBadge
              v-if="child.visibility !== 'active'"
              :tone="visibilityMeta[child.visibility].tone"
              :icon="visibilityMeta[child.visibility].icon"
              >{{ visibilityMeta[child.visibility].label }}</LazyVStatusBadge
            >
            <div class="ms-auto flex items-center gap-1.5">
              <template v-if="reorderMode">
                <LazyVButton
                  variant="icon"
                  size="sm"
                  icon="lucide:arrow-up"
                  :aria-label="`Move ${child.name} up`"
                  :disabled="child.order === 0"
                  @click="move(child, -1)"
                />

                <LazyVButton
                  variant="icon"
                  size="sm"
                  icon="lucide:arrow-down"
                  :aria-label="`Move ${child.name} down`"
                  :disabled="child.order === childrenOf(root.id).length - 1"
                  @click="move(child, 1)"
                />
              </template>

              <LazyVRowActions
                :label="`Actions for ${child.name}`"
                @edit="emit('select', child.id)"
                @remove="emit('remove', child)"
              />
            </div>
          </li>
        </ul>
      </li>

      <li v-if="!roots.length" class="py-6">
        <slot name="empty" />
      </li>
    </ul>

    <!-- Flat matrix -->
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-sm">
        <caption class="sr-only">
          All categories
        </caption>
        <thead>
          <tr class="border-y border-line bg-ink">
            <th scope="col" class="label-caps px-4 py-3 text-start font-normal">
              Code
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Category
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Parent
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Slug
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
              SKUs
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Status
            </th>
            <th scope="col" class="px-4 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr
            v-for="c in flat"
            :key="c.id"
            class="transition-colors duration-fast hover:bg-raised/60"
            :class="selectedId === c.id && 'bg-accent-soft'"
          >
            <td class="px-4 py-3 font-mono text-xs" dir="ltr">{{ c.code }}</td>
            <td class="px-3 py-3 font-medium" :class="c.parentId && 'ps-6'">
              {{ c.name }}
            </td>
            <td class="px-3 py-3 text-mute">
              {{ c.parentId ? byId.get(c.parentId)?.name : "Root" }}
            </td>
            <td class="px-3 py-3 font-mono text-xs text-mute" dir="ltr">
              {{ c.slug }}
            </td>
            <td class="px-3 py-3 text-end font-mono text-xs tabular-nums">
              {{ number(c.skus) }}
            </td>
            <td class="px-3 py-3">
              <LazyVStatusBadge
                :tone="visibilityMeta[c.visibility].tone"
                :icon="visibilityMeta[c.visibility].icon"
                >{{ visibilityMeta[c.visibility].label }}</LazyVStatusBadge
              >
            </td>
            <td class="px-4 py-3 text-end">
              <div class="flex justify-end">
                <LazyVRowActions
                  :label="`Actions for ${c.name}`"
                  @edit="emit('select', c.id)"
                  @remove="emit('remove', c)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="!flat.length">
            <td colspan="7" class="p-6"><slot name="empty" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { visibilityMeta } from "~/data/category-meta";
import type { Category } from "~/types/admin/categories";

const props = defineProps<{
  nodes: Category[];
  filter: string;
  view: "tree" | "flat";
  selectedId: string | null;
  reorderMode: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  addChild: [parentId: string];
  remove: [category: Category];
  visibility: [category: Category, on: boolean];
  reorder: [parentId: string | null, ids: string[]];
}>();

const expanded = defineModel<string[]>("expanded", { default: () => [] });

const { number } = useFormatters();

const byId = computed(() => new Map(props.nodes.map((n) => [n.id, n])));
const sorted = (list: Category[]) =>
  [...list].sort((a, b) => a.order - b.order);

const q = computed(() => props.filter.trim().toLowerCase());
const matches = (c: Category) =>
  !q.value ||
  [c.name, c.slug, c.code].some((v) => v.toLowerCase().includes(q.value));

const allRoots = computed(() => sorted(props.nodes.filter((n) => !n.parentId)));
const allChildren = (id: string) =>
  sorted(props.nodes.filter((n) => n.parentId === id));

// A search keeps a master visible when it, or any of its children, matches.
const roots = computed(() =>
  allRoots.value.filter((r) => matches(r) || allChildren(r.id).some(matches)),
);
const childrenOf = (id: string) => {
  const all = allChildren(id);
  const root = byId.value.get(id);
  return q.value && root && !matches(root) ? all.filter(matches) : all;
};

const flat = computed(() =>
  allRoots.value.flatMap((r) => [r, ...allChildren(r.id)]).filter(matches),
);

// While searching, every branch that has a hit is shown open.
const isOpen = (id: string) => !!q.value || expanded.value.includes(id);
const toggle = (id: string) => {
  expanded.value = expanded.value.includes(id)
    ? expanded.value.filter((x) => x !== id)
    : [...expanded.value, id];
};

// --- Reordering: arrow buttons (reorder mode) and drag and drop ---
const siblingIds = (parentId: string | null) =>
  sorted(props.nodes.filter((n) => n.parentId === parentId)).map((n) => n.id);

const move = (c: Category, delta: -1 | 1) => {
  const ids = siblingIds(c.parentId);
  const i = ids.indexOf(c.id);
  const j = i + delta;
  if (j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  emit("reorder", c.parentId, ids);
};

const dragging = ref<Category | null>(null);
const over = ref<{ id: string; after: boolean } | null>(null);

const onDragStart = (e: DragEvent, c: Category) => {
  dragging.value = c;
  e.dataTransfer?.setData("text/plain", c.id);
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  const row = (e.currentTarget as HTMLElement).closest("li");
  if (row) e.dataTransfer?.setDragImage(row, 24, 24);
};

// Items only move among their own siblings; the parent is changed in the inspector.
const onDragOver = (e: DragEvent, target: Category) => {
  const d = dragging.value;
  if (!d || d.id === target.id || d.parentId !== target.parentId) return;
  e.preventDefault();
  e.stopPropagation();
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  over.value = { id: target.id, after: e.clientY > rect.top + rect.height / 2 };
};

const onDrop = (e: DragEvent, target: Category) => {
  const d = dragging.value;
  const o = over.value;
  reset();
  if (!d || !o || d.parentId !== target.parentId || d.id === target.id) return;
  e.preventDefault();
  e.stopPropagation();
  const before = siblingIds(d.parentId);
  const ids = before.filter((id) => id !== d.id);
  ids.splice(ids.indexOf(target.id) + (o.after ? 1 : 0), 0, d.id);
  if (ids.some((id, i) => id !== before[i])) emit("reorder", d.parentId, ids);
};

const reset = () => {
  dragging.value = null;
  over.value = null;
};

const dropClass = (c: Category) =>
  over.value?.id === c.id
    ? over.value.after
      ? "!border-b-accent !border-b-2"
      : "!border-t-accent !border-t-2"
    : "";
</script>