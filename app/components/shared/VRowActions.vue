<template>
  <LazyVMenu :label="label" width="w-max min-w-44 max-w-xs">
    <template #trigger="{ attrs, toggle }">
      <LazyVButton
        v-bind="attrs"
        variant="icon"
        size="sm"
        icon="lucide:ellipsis"
        :aria-label="label"
        @click="toggle"
      />
    </template>

    <!-- Page-specific items go first, using class="menu-item w-full" and role="menuitem". -->
    <slot />

    <button
      v-if="edit"
      type="button"
      role="menuitem"
      class="menu-item w-full"
      @click="emit('edit')"
    >
      <span class="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true"><Icon name="lucide:pencil" size="16" /></span> {{ $t("common_ui.edit") }}
    </button>
    <button
      v-if="duplicate"
      type="button"
      role="menuitem"
      class="menu-item w-full"
      @click="emit('duplicate')"
    >
      <span class="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true"><Icon name="lucide:copy" size="16" /></span> {{ $t("btn.duplicate") }}
    </button>
    <button
      v-if="remove"
      type="button"
      role="menuitem"
      class="menu-item w-full text-accent"
      @click="emit('remove')"
    >
      <span class="grid h-4 w-4 shrink-0 place-items-center" aria-hidden="true"><Icon name="lucide:trash-2" size="16" /></span> {{ $t("common_ui.delete") }}
    </button>
  </LazyVMenu>
</template>

<script lang="ts" setup>
/**
 * The ⋯ menu at the end of a row, the same on every list: Edit, optional Duplicate,
 * and Delete in the danger colour. Extra actions go in the default slot.
 *
 *   <VRowActions label="Actions for Kopira Pro A3" duplicate @edit="…" @duplicate="…" @remove="…" />
 */

withDefaults(
  defineProps<{
    /** Accessible name, for example "Actions for {name}". */
    label: string;
    edit?: boolean;
    duplicate?: boolean;
    remove?: boolean;
  }>(),
  { edit: true, duplicate: false, remove: true },
);

const emit = defineEmits<{ edit: []; duplicate: []; remove: [] }>();
</script>