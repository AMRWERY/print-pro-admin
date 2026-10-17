<template>
  <div :aria-busy="loading || undefined">
    <div v-if="loading" class="space-y-2 p-4 sm:p-5">
      <LazyVSkeletonLoader v-for="n in 8" :key="n" class="h-9" />
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[40rem] border-collapse text-sm">
        <caption class="sr-only">
          Privileges granted to each role. A check means the role has it.
        </caption>
        <thead>
          <tr class="border-b border-line bg-ink">
            <th
              scope="col"
              class="sticky start-0 z-10 bg-ink px-4 py-3 text-start"
            >
              <span class="label-caps">Module · privilege</span>
            </th>
            <th
              v-for="r in roles"
              :key="r.id"
              scope="col"
              class="min-w-28 px-2 py-3 text-center align-bottom"
            >
              <button
                type="button"
                class="mx-auto block max-w-28 text-center font-mono text-xs font-semibold leading-tight hover:text-accent focus-visible:underline"
                :title="`Edit ${r.name}`"
                @click="emit('edit', r)"
              >
                {{ r.name }}
              </button>
              <span class="meta mt-0.5 block"
                >{{ r.permissions.length }}/{{ permissionTotal }}</span
              >
            </th>
          </tr>
        </thead>

        <tbody v-for="m in permissionModules" :key="m.id">
          <tr class="bg-raised/50">
            <th
              :colspan="roles.length + 1"
              scope="colgroup"
              class="sticky start-0 px-4 py-2 text-start"
            >
              <span
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
              >
                <Icon
                  :name="m.icon"
                  size="14"
                  class="text-accent"
                  aria-hidden="true"
                />
                {{ m.label }}
              </span>
            </th>
          </tr>
          <tr
            v-for="p in m.privileges"
            :key="p.id"
            class="border-b border-line transition-colors duration-fast hover:bg-raised/40"
          >
            <th
              scope="row"
              class="sticky start-0 z-10 bg-surface px-4 py-2 text-start font-normal"
            >
              <span class="flex items-center gap-2">
                {{ p.label }}
                <Icon
                  v-if="p.sensitive"
                  name="lucide:shield-alert"
                  size="12"
                  class="text-accent"
                  aria-hidden="true"
                />
                <span v-if="p.sensitive" class="sr-only">sensitive</span>
              </span>
            </th>
            <td v-for="r in roles" :key="r.id" class="px-2 py-2 text-center">
              <template v-if="r.permissions.includes(`${m.id}.${p.id}`)">
                <Icon
                  name="lucide:check"
                  size="16"
                  class="text-success"
                  aria-hidden="true"
                />
                <span class="sr-only">Granted</span>
              </template>
              <template v-else>
                <Icon
                  name="lucide:minus"
                  size="16"
                  class="text-mute/50"
                  aria-hidden="true"
                />
                <span class="sr-only">Not granted</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { permissionModules, permissionTotal } from "~/data/users-meta";
import type { RoleRow } from "~/types/admin/users";

defineProps<{ roles: RoleRow[]; loading?: boolean }>();

const emit = defineEmits<{ edit: [role: RoleRow] }>();
</script>