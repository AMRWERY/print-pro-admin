<template>
  <div :aria-busy="loading || undefined">
    <ul v-if="loading" class="space-y-2 p-4 sm:p-5">
      <li v-for="n in Math.min(perPage, 8)" :key="n">
        <LazyVSkeletonLoader class="h-20" />
      </li>
    </ul>

    <template v-else>
      <div
        class="flex items-center gap-3 border-b border-line bg-ink px-4 py-2.5"
      >
        <LazyVCheckboxImput
          name="pickAllOperators"
          label="Select all operators on this page"
          hide-label
          size="sm"
          :model-value="allSelected"
          :indeterminate="selected.length > 0 && !allSelected"
          :disabled="!selectable.length"
          @update:model-value="toggleAll"
        />
        <span class="label-caps">Operator</span>
        <span class="label-caps ms-auto hidden md:block"
          >Assigned role · security status</span
        >
      </div>

      <ul class="divide-y divide-line">
        <li
          v-for="o in rows"
          :key="o.id"
          class="flex items-start gap-3 px-4 py-3 transition-colors duration-fast hover:bg-raised/60"
          :class="[
            selectedId === o.id && 'bg-accent-soft',
            o.status === 'suspended' &&
              selectedId !== o.id &&
              'bg-accent-soft/40',
          ]"
        >
          <LazyVCheckboxImput
            :name="`pick-${o.id}`"
            :label="`Select ${o.name}`"
            hide-label
            size="sm"
            class="mt-2"
            :disabled="o.isYou"
            :model-value="selected.includes(o.id)"
            @update:model-value="toggle(o.id)"
          />

          <LazyVAvatar
            :initials="initialsOf(o.name)"
            shape="square"
            :tone="o.status === 'suspended' || o.isYou ? 'accent' : 'neutral'"
            class="mt-0.5 shrink-0"
          />

          <div
            class="grid min-w-0 flex-1 gap-x-4 gap-y-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          >
            <div class="min-w-0">
              <p class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="truncate text-start text-sm font-semibold hover:text-accent focus-visible:underline"
                  :aria-current="selectedId === o.id ? 'true' : undefined"
                  @click="emit('select', o)"
                >
                  {{ o.name }}
                </button>

                <LazyVStatusBadge v-if="o.isYou" tone="accent"
                  >You</LazyVStatusBadge
                >
              </p>
              <p class="meta mt-0.5 font-mono">{{ o.id }}</p>
              <p class="meta truncate font-mono" dir="ltr">{{ o.email }}</p>
            </div>

            <div class="min-w-0 space-y-1.5">
              <p class="flex flex-wrap items-center gap-2">
                <LazyVStatusBadge
                  :tone="o.roleId === superRoleId ? 'accent' : 'info'"
                  icon="lucide:shield-user"
                  >{{ o.roleName }}</LazyVStatusBadge
                >

                <LazyVStatusBadge
                  :tone="statusMeta[o.status].tone"
                  :icon="statusMeta[o.status].icon"
                  >{{ statusMeta[o.status].label }}</LazyVStatusBadge
                >
              </p>
              <p class="meta font-mono">Node: {{ o.node || "not set" }}</p>
              <p class="meta flex flex-wrap items-center gap-x-3 gap-y-0.5">
                <span class="inline-flex items-center gap-1">
                  <Icon
                    :name="
                      o.keyEnrolled ? 'lucide:key-round' : 'lucide:key-square'
                    "
                    size="12"
                    aria-hidden="true"
                  />
                  {{ o.keyEnrolled ? "Hardware key" : "No hardware key" }}
                </span>
                <span class="tabular-nums"
                  >{{ o.sessions }} session{{
                    o.sessions === 1 ? "" : "s"
                  }}</span
                >
                <span>{{ lastSeen(o) }}</span>
                <span v-if="o.failedAttempts" class="text-accent tabular-nums"
                  >{{ o.failedAttempts }} failed sign-in{{
                    o.failedAttempts === 1 ? "" : "s"
                  }}</span
                >
              </p>
            </div>
          </div>

          <LazyVRowActions
            class="mt-1"
            :label="`Actions for ${o.name}`"
            :remove="!o.isYou"
            @edit="emit('edit', o)"
            @remove="emit('remove', o)"
          >
            <button
              v-if="o.status !== 'suspended' && !o.isYou"
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('suspend', o)"
            >
              <Icon name="lucide:lock" size="16" aria-hidden="true" /> Suspend
            </button>
            <button
              v-if="o.status === 'suspended'"
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('restore', o)"
            >
              <Icon name="lucide:lock-open" size="16" aria-hidden="true" />
              Restore access
            </button>
            <button
              v-if="o.sessions > (o.isYou ? 1 : 0)"
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('revoke', o)"
            >
              <Icon name="lucide:log-out" size="16" aria-hidden="true" /> End
              sessions
            </button>
          </LazyVRowActions>
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { initialsOf, statusMeta } from "~/data/users-meta";
import type { OperatorRow } from "~/types/admin/users";

const props = defineProps<{
  rows: OperatorRow[];
  loading?: boolean;
  perPage: number;
  /** The operator whose role is open in the inspector. */
  selectedId: string | null;
  superRoleId: string;
}>();

const emit = defineEmits<{
  select: [row: OperatorRow];
  edit: [row: OperatorRow];
  remove: [row: OperatorRow];
  suspend: [row: OperatorRow];
  restore: [row: OperatorRow];
  revoke: [row: OperatorRow];
}>();

const selected = defineModel<string[]>("selected", { required: true });

// The signed-in admin can't be picked for bulk actions that would lock them out.
const selectable = computed(() => props.rows.filter((o) => !o.isYou));
const allSelected = computed(
  () =>
    selectable.value.length > 0 &&
    selectable.value.every((o) => selected.value.includes(o.id)),
);

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};

const toggleAll = () => {
  selected.value = allSelected.value ? [] : selectable.value.map((o) => o.id);
};

// The demo clock is fixed, so "last seen" is shown relative to it.
const NOW = Date.parse("2026-10-31T12:00:00Z");

const lastSeen = (o: OperatorRow) => {
  const m = Math.round((NOW - Date.parse(o.lastSeen)) / 60_000);
  if (m < 2) return "Online now";
  if (m < 60) return `Seen ${m} min ago`;
  if (m < 60 * 48) return `Seen ${Math.round(m / 60)} h ago`;
  return `Seen ${Math.round(m / 1440)} days ago`;
};
</script>