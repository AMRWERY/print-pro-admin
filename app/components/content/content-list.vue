<template>
  <div :aria-busy="loading || undefined">
    <!-- Loading: skeletons shaped like the rows or cards -->
    <ul v-if="loading" class="p-4 sm:p-5" :class="gridClass">
      <li v-for="n in Math.min(perPage, 8)" :key="n">
        <LazyVSkeletonLoader :class="view === 'grid' ? 'h-64' : 'h-24'" />
      </li>
    </ul>

    <template v-else>
      <div
        v-if="view === 'list'"
        class="flex items-center justify-between gap-3 border-b border-line bg-ink px-4 py-2.5"
      >
        <span class="label-caps">Sequence &amp; placement</span>
        <span class="label-caps hidden text-end sm:block"
          >Drag the handle, or press ↑ ↓ on it, to reorder</span
        >
      </div>

      <TransitionGroup
        tag="ul"
        :name="reduced === 'reduce' ? '' : 'rows'"
        :class="
          view === 'grid' ? ['p-4 sm:p-5', gridClass] : 'divide-y divide-line'
        "
      >
        <li
          v-for="b in rows"
          :key="b.id"
          class="bg-surface transition-colors duration-fast"
          :class="[
            view === 'grid'
              ? 'flex flex-col overflow-hidden rounded-card border border-line'
              : 'flex items-start gap-3 px-4 py-3 hover:bg-raised/60',
            selectedId === b.id &&
              (view === 'grid' ? '!border-accent' : '!bg-accent-soft'),
            overId === b.id &&
              dragId !== b.id &&
              'ring-2 ring-inset ring-accent',
            dragId === b.id && 'opacity-50',
          ]"
          @dragover="onDragOver($event, b)"
          @drop="onDrop($event, b)"
        >
          <!-- List row -->
          <template v-if="view === 'list'">
            <button
              v-if="canReorder"
              :id="`handle-${b.id}`"
              type="button"
              draggable="true"
              class="mt-1 grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded-tight text-mute transition duration-fast hover:bg-raised hover:text-paper focus-visible:ring-2 focus-visible:ring-cyan active:cursor-grabbing"
              :aria-label="`Reorder ${b.title}. Position ${b.position}. Use the up and down arrow keys to move it.`"
              @dragstart="onDragStart($event, b)"
              @dragend="reset"
              @keydown.up.prevent="move(b, -1)"
              @keydown.down.prevent="move(b, 1)"
            >
              <Icon name="lucide:grip-vertical" size="16" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="w-28 shrink-0 overflow-hidden rounded-tight transition duration-fast hover:opacity-90 focus-visible:ring-2 focus-visible:ring-cyan sm:w-36"
              :aria-label="`Preview ${b.title}`"
              @click="emit('preview', b)"
            >
              <content-preview :block="b" thumb />
            </button>

            <div class="min-w-0 flex-1">
              <p class="meta flex flex-wrap items-center gap-x-2">
                <span class="font-semibold uppercase tracking-wider">{{
                  kindMeta[b.kind].slot
                }}</span>
                <span aria-hidden="true">·</span>
                <span class="font-mono"
                  >#{{ String(b.position).padStart(2, "0") }}</span
                >
              </p>
              <button
                type="button"
                class="mt-0.5 block max-w-full truncate text-start text-sm font-semibold hover:text-accent focus-visible:underline"
                :aria-current="selectedId === b.id ? 'true' : undefined"
                @click="emit('select', b)"
              >
                {{ b.title }}
              </button>
              <p class="meta mt-0.5 truncate font-mono" dir="ltr">
                {{ b.link }}
              </p>
              <p
                class="meta mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5"
              >
                <span class="inline-flex items-center gap-1">
                  <Icon
                    name="lucide:calendar-range"
                    size="12"
                    aria-hidden="true"
                  />
                  {{ windowLabel(b.startsAt, b.endsAt) }}
                </span>
                <span v-if="b.views" class="tabular-nums"
                  >{{ compact(b.views) }} views ·
                  {{ percent(b.ctr, 1) }} CTR</span
                >
                <span v-else>No traffic yet</span>
              </p>
            </div>

            <div
              class="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center"
            >
              <LazyVStatusBadge
                :tone="stateMeta[b.state].tone"
                :icon="stateMeta[b.state].icon"
                >{{ stateMeta[b.state].label }}</LazyVStatusBadge
              >
              <LazyVSwitch
                :model-value="b.status === 'published'"
                :label="`${b.status === 'published' ? 'Unpublish' : 'Publish'} ${b.title}`"
                @update:model-value="(v: boolean) => emit('toggle', b, v)"
              />
            </div>
          </template>

          <!-- Grid card -->
          <template v-else>
            <button
              type="button"
              class="block w-full focus-visible:ring-2 focus-visible:ring-cyan"
              :aria-label="`Preview ${b.title}`"
              @click="emit('preview', b)"
            >
              <content-preview
                :block="b"
                thumb
                class="!rounded-none !border-0"
              />
            </button>
            <div class="flex flex-1 flex-col gap-2 p-3">
              <p class="meta flex items-center justify-between gap-2">
                <span class="font-semibold uppercase tracking-wider">{{
                  kindMeta[b.kind].slot
                }}</span>
                <LazyVStatusBadge
                  :tone="stateMeta[b.state].tone"
                  :icon="stateMeta[b.state].icon"
                  >{{ stateMeta[b.state].label }}</LazyVStatusBadge
                >
              </p>
              <button
                type="button"
                class="line-clamp-2 text-start text-sm font-semibold hover:text-accent focus-visible:underline"
                @click="emit('select', b)"
              >
                {{ b.title }}
              </button>
              <p class="meta">{{ windowLabel(b.startsAt, b.endsAt) }}</p>
              <div class="mt-auto flex items-center justify-between pt-1">
                <LazyVSwitch
                  :model-value="b.status === 'published'"
                  :label="`${b.status === 'published' ? 'Unpublish' : 'Publish'} ${b.title}`"
                  @update:model-value="(v: boolean) => emit('toggle', b, v)"
                />
                <span class="meta tabular-nums">{{
                  b.views ? `${percent(b.ctr, 1)} CTR` : "No traffic"
                }}</span>
              </div>
            </div>
          </template>

          <LazyVRowActions
            :class="view === 'grid' ? 'absolute end-2 top-2' : 'mt-0.5'"
            :label="`Actions for ${b.title}`"
            duplicate
            @edit="emit('select', b)"
            @duplicate="emit('duplicate', b)"
            @remove="emit('remove', b)"
          >
            <button
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('preview', b)"
            >
              <Icon name="lucide:eye" size="16" aria-hidden="true" /> Preview
            </button>
            <button
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('toggle', b, b.status !== 'published')"
            >
              <Icon
                :name="
                  b.status === 'published' ? 'lucide:eye-off' : 'lucide:rocket'
                "
                size="16"
                aria-hidden="true"
              />
              {{ b.status === "published" ? "Unpublish" : "Publish" }}
            </button>
          </LazyVRowActions>
        </li>
      </TransitionGroup>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { kindMeta, stateMeta, windowLabel } from "~/data/content-meta";
import type { BlockRow } from "~/types/admin/content";

const props = defineProps<{
  rows: BlockRow[];
  loading?: boolean;
  perPage: number;
  selectedId: string | null;
  view: "list" | "grid";
}>();

const emit = defineEmits<{
  select: [row: BlockRow];
  preview: [row: BlockRow];
  duplicate: [row: BlockRow];
  remove: [row: BlockRow];
  toggle: [row: BlockRow, publish: boolean];
  reorder: [ids: string[]];
}>();

const { compact, percent } = useFormatters();
const reduced = usePreferredReducedMotion();

// Order is changed in the list layout; the grid is for browsing.
const canReorder = computed(
  () => props.view === "list" && props.rows.length > 1,
);

const gridClass = computed(() =>
  props.view === "grid"
    ? "grid gap-4 sm:grid-cols-2 2xl:grid-cols-3 [&>li]:relative"
    : "space-y-2",
);

// --- Reordering: drag a handle, or press the arrow keys on it ---
const dragId = ref<string | null>(null);
const overId = ref<string | null>(null);

const reset = () => {
  dragId.value = null;
  overId.value = null;
};

const onDragStart = (e: DragEvent, b: BlockRow) => {
  dragId.value = b.id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", b.id);
    const row = (e.target as HTMLElement).closest("li");
    if (row) e.dataTransfer.setDragImage(row, 24, 24);
  }
};

const onDragOver = (e: DragEvent, b: BlockRow) => {
  if (!dragId.value) return;
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  overId.value = b.id;
};

const onDrop = (e: DragEvent, target: BlockRow) => {
  e.preventDefault();
  const from = dragId.value;
  reset();
  if (!from || from === target.id) return;
  const ids = props.rows.map((r) => r.id);
  const a = ids.indexOf(from);
  const b = ids.indexOf(target.id);
  if (a < 0 || b < 0) return;
  ids.splice(b, 0, ids.splice(a, 1)[0]!);
  emit("reorder", ids);
};

const move = async (b: BlockRow, delta: -1 | 1) => {
  const ids = props.rows.map((r) => r.id);
  const i = ids.indexOf(b.id);
  const j = i + delta;
  if (j < 0 || j >= ids.length) return;
  ids.splice(j, 0, ids.splice(i, 1)[0]!);
  emit("reorder", ids);
  // The row moves in the DOM; keep the keyboard on its handle.
  await nextTick();
  document.getElementById(`handle-${b.id}`)?.focus();
};
</script>

<style scoped>
.rows-move {
  transition: transform 250ms ease;
}
</style>