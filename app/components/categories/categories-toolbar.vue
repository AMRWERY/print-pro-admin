<template>
  <div class="flex flex-wrap items-center gap-3">
    <form role="search" class="min-w-0 flex-1 basis-56" @submit.prevent>
      <LazyVInput
        v-model="filter"
        name="categoryFilter"
        type="search"
        :label="$t('categories_ui.tb_filter_label')"
        hide-label
        icon="lucide:filter"
        autocomplete="off"
        :placeholder="$t('categories_ui.filter_placeholder')"
      />
    </form>

    <LazyVSegmented v-model="view" :label="$t('categories_ui.tb_layout')" :options="viewOptions" />

    <div v-if="view === 'tree'" class="flex flex-wrap items-center gap-2">
      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:chevrons-up-down"
        @click="emit('expand')"
        >{{ $t('categories_ui.tb_expand') }}</LazyVButton
      >

      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:chevrons-down-up"
        @click="emit('collapse')"
        >{{ $t('categories_ui.tb_collapse') }}</LazyVButton
      >

      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:arrow-up-down"
        :aria-pressed="reorderMode"
        :class="reorderMode && '!border-accent !text-accent'"
        @click="reorderMode = !reorderMode"
        >{{ $t('btn.reorder_mode') }}</LazyVButton
      >
    </div>

    <LazyVButton icon="lucide:circle-plus" @click="emit('add')"
      >{{ $t('categories_ui.btn_add_category') }}</LazyVButton
    >
  </div>
</template>

<script lang="ts" setup>
const filter = defineModel<string>("filter", { required: true });
const view = defineModel<"tree" | "flat">("view", { required: true });
const reorderMode = defineModel<boolean>("reorderMode", { required: true });

const emit = defineEmits<{ add: []; expand: []; collapse: [] }>();

const { t } = useI18n();

const viewOptions = computed(() => [
  { value: "tree" as const, label: t("categories_ui.tb_view_tree") },
  { value: "flat" as const, label: t("categories_ui.tb_view_flat") },
]);
</script>