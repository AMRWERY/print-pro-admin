<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <form role="search" class="min-w-52 flex-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="contentSearch"
          type="search"
          :label="$t('content_ui.tb_search_label')"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          :placeholder="$t('content_ui.tb_search_placeholder')"
        />
      </form>

      <LazyVSelectInput
        v-model="state"
        name="contentState"
        :label="$t('common_ui.status')"
        hide-label
        :options="stateOptions"
        class="w-full sm:w-52"
      />

      <LazyVSegmented v-model="view" :label="$t('content_ui.tb_layout')" :options="viewOptions" />
    </div>

    <div
      role="group"
      :aria-label="$t('content_ui.content_type')"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="t in tabs"
        :key="t.value"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95"
        :class="
          tab === t.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        :aria-pressed="tab === t.value"
        @click="tab = t.value"
      >
        {{ t.label }}
        <span class="tabular-nums"
          >({{ counts ? number(counts[t.value]) : "…" }})</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { stateOptions, tabs } from "~/data/content-meta";
import type {
  BlockStatusFilter,
  BlockTab,
  BlocksResponse,
} from "~/types/admin/content";

defineProps<{ counts?: BlocksResponse["counts"] | null }>();

const q = defineModel<string>("q", { required: true });
const tab = defineModel<BlockTab>("tab", { required: true });
const state = defineModel<BlockStatusFilter>("state", { required: true });
const view = defineModel<"list" | "grid">("view", { required: true });

const { number } = useFormatters();
const { t } = useI18n();

const viewOptions = computed(() => [
  { value: "list" as const, label: t("content_ui.tb_view_list") },
  { value: "grid" as const, label: t("content_ui.tb_view_grid") },
]);
</script>