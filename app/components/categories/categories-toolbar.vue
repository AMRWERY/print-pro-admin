<template>
  <div class="flex flex-wrap items-center gap-3">
    <form role="search" class="min-w-0 flex-1 basis-56" @submit.prevent>
      <LazyVInput
        v-model="filter"
        name="categoryFilter"
        type="search"
        label="Filter categories"
        hide-label
        icon="lucide:filter"
        autocomplete="off"
        placeholder="Filter by name, slug or code…"
      />
    </form>

    <LazyVSegmented v-model="view" label="Layout" :options="viewOptions" />

    <div v-if="view === 'tree'" class="flex flex-wrap items-center gap-2">
      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:chevrons-up-down"
        @click="emit('expand')"
        >Expand</LazyVButton
      >

      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:chevrons-down-up"
        @click="emit('collapse')"
        >Collapse</LazyVButton
      >

      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:arrow-up-down"
        :aria-pressed="reorderMode"
        :class="reorderMode && '!border-accent !text-accent'"
        @click="reorderMode = !reorderMode"
        >Reorder mode</LazyVButton
      >
    </div>

    <LazyVButton icon="lucide:circle-plus" @click="emit('add')"
      >Add category</LazyVButton
    >
  </div>
</template>

<script lang="ts" setup>
const filter = defineModel<string>("filter", { required: true });
const view = defineModel<"tree" | "flat">("view", { required: true });
const reorderMode = defineModel<boolean>("reorderMode", { required: true });

const emit = defineEmits<{ add: []; expand: []; collapse: [] }>();

const viewOptions = [
  { value: "tree" as const, label: "Hierarchy" },
  { value: "flat" as const, label: "Flat matrix" },
];
</script>