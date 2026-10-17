<template>
  <LazyVMenu :label="label" width="w-44">
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

    <button v-if="edit" type="button" role="menuitem" class="menu-item w-full" @click="emit('edit')">
      <Icon name="lucide:pencil" size="16" aria-hidden="true" /> Edit
    </button>
    <button v-if="duplicate" type="button" role="menuitem" class="menu-item w-full" @click="emit('duplicate')">
      <Icon name="lucide:copy" size="16" aria-hidden="true" /> Duplicate
    </button>
    <button v-if="remove" type="button" role="menuitem" class="menu-item w-full text-accent" @click="emit('remove')">
      <Icon name="lucide:trash-2" size="16" aria-hidden="true" /> Delete
    </button>
  </LazyVMenu>
</template>

<script lang="ts" setup>
/**
 * The ⋯ menu at the end of a row, the same on every list: Edit, optional Duplicate,
 * and Delete in the danger colour. Extra actions go in the default slot.
 *
 *   <VRowActions label="Actions for Hasselblad" duplicate @edit="…" @duplicate="…" @remove="…" />
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
