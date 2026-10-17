<template>
  <div
    class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]"
  >
    <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
      <LazyVInput
        v-model="q"
        name="operatorSearch"
        type="search"
        label="Search operators"
        hide-label
        icon="lucide:search"
        autocomplete="off"
        placeholder="Search name, email, ID or node…"
      />
    </form>

    <LazyVSelectInput
      v-model="role"
      name="operatorRole"
      label="Role"
      hide-label
      :options="roleOptions"
    />

    <LazyVSelectInput
      v-model="status"
      name="operatorStatus"
      label="Status"
      hide-label
      :options="statusOptions"
    />
  </div>
</template>

<script lang="ts" setup>
import { statusOptions } from "~/data/users-meta";
import type { OperatorStatus, RoleRow } from "~/types/admin/users";

const props = defineProps<{ roles: RoleRow[] }>();

const q = defineModel<string>("q", { required: true });
const role = defineModel<string>("role", { required: true });
const status = defineModel<"all" | OperatorStatus>("status", {
  required: true,
});

const roleOptions = computed(() => [
  { value: "all", label: "Role: all" },
  ...props.roles.map((r) => ({ value: r.id, label: r.name })),
]);
</script>