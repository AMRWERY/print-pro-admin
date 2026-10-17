<template>
  <div :aria-busy="loading || undefined">
    <ul
      v-if="loading"
      class="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 2xl:grid-cols-3"
    >
      <li v-for="n in 5" :key="n"><LazyVSkeletonLoader class="h-44" /></li>
    </ul>

    <ul v-else class="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 2xl:grid-cols-3">
      <li
        v-for="r in roles"
        :key="r.id"
        class="flex flex-col rounded-card border bg-surface p-4 transition-colors duration-fast"
        :class="activeId === r.id ? 'border-accent' : 'border-line'"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="font-mono text-xs text-mute">{{ r.code }}</p>
            <h3 class="mt-0.5 font-display text-base font-bold leading-tight">
              {{ r.name }}
            </h3>
          </div>

          <LazyVRowActions
            :label="`Actions for ${r.name}`"
            :remove="!r.system"
            :edit="true"
            duplicate
            @edit="emit('edit', r)"
            @duplicate="emit('clone', r)"
            @remove="emit('remove', r)"
          />
        </div>

        <p class="mt-2 line-clamp-3 text-sm text-mute">{{ r.description }}</p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <LazyVStatusBadge
            :tone="r.system ? 'accent' : 'info'"
            :icon="r.system ? 'lucide:lock' : 'lucide:shield'"
            >{{ r.system ? "Locked" : r.scope }}</LazyVStatusBadge
          >

          <LazyVStatusBadge tone="neutral" icon="lucide:users-round"
            >{{ r.operators }} operator{{
              r.operators === 1 ? "" : "s"
            }}</LazyVStatusBadge
          >
        </div>

        <div class="mt-auto pt-4">
          <p class="flex justify-between font-mono text-xs tabular-nums">
            <span
              >{{ r.permissions.length }} of
              {{ permissionTotal }} privileges</span
            >
            <span class="text-mute"
              >{{
                Math.round((r.permissions.length / permissionTotal) * 100)
              }}%</span
            >
          </p>

          <LazyVMeter
            class="mt-1"
            :value="(r.permissions.length / permissionTotal) * 100"
            :tone="r.system ? 'accent' : 'success'"
            :label="`Privileges granted to ${r.name}`"
          />
        </div>
      </li>

      <li>
        <button
          type="button"
          class="grid h-full min-h-44 w-full place-items-center rounded-card border-2 border-dashed border-line p-4 text-center text-mute transition duration-fast hover:border-accent hover:text-paper focus-visible:ring-2 focus-visible:ring-cyan"
          @click="emit('create')"
        >
          <span>
            <Icon
              name="lucide:circle-plus"
              size="24"
              class="mx-auto text-accent"
              aria-hidden="true"
            />
            <span class="mt-2 block text-sm font-semibold"
              >New custom role</span
            >
            <span class="meta mt-1 block"
              >Start with no privileges and add what it needs.</span
            >
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { permissionTotal } from "~/data/users-meta";
import type { RoleRow } from "~/types/admin/users";

defineProps<{
  roles: RoleRow[];
  loading?: boolean;
  activeId: string | null;
}>();

const emit = defineEmits<{
  edit: [role: RoleRow];
  clone: [role: RoleRow];
  remove: [role: RoleRow];
  create: [];
}>();
</script>