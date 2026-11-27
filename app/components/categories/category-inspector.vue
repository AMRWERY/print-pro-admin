<template>
  <LazyVPanel
    :title="category ? $t('categories_ui.inspector_title') : $t('categories_ui.inspector_create_title')"
    :subtitle="category ? category.code : $t('categories_ui.top_level')"
    :icon="category ? 'lucide:folder-tree' : 'lucide:folder-plus'"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        :aria-label="$t('common_ui.close_inspector')"
        data-close-btn
        @click="emit('close')"
      />
    </template>

    <form
      id="category-form"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <LazyVInput
        v-model="form.name"
        name="catName"
        :label="$t('categories_ui.cat_name')"
        required
        rules="required|min:2|max:80"
        maxlength="80"
      />

      <LazyVInput
        v-model="form.slug"
        name="catSlug"
        :label="$t('categories_ui.cat_slug')"
        required
        rules="required|min:2|max:120"
        input-class="font-mono"
        :hint="$t('categories_ui.cat_slug_hint')"
        @update:model-value="slugTouched = true"
      />

      <LazyVInput
        v-if="!category"
        v-model="form.key"
        name="catKey"
        :label="$t('categories_ui.cat_key')"
        optional
        input-class="font-mono"
        maxlength="40"
        :hint="$t('categories_ui.cat_key_hint')"
      />
      <div v-else>
        <p class="label">{{ $t('categories_ui.cat_key') }}</p>
        <p class="field mt-1.5 font-mono text-sm text-mute" dir="ltr">{{ category.key }}</p>
        <p class="mt-1 text-xs text-mute">
          {{ $t('categories_ui.cat_key_locked') }}
        </p>
      </div>

      <LazyVSelectInput
        v-if="!category"
        v-model="form.kind"
        name="catKind"
        :label="$t('categories_ui.cat_behaves_like')"
        :options="kindOptions"
        :hint="$t('categories_ui.cat_behaves_hint')"
      />
      <div v-else>
        <p class="label">{{ $t('categories_ui.cat_behaves_like') }}</p>
        <p class="field mt-1.5 text-sm text-mute">{{ kindLabel }}</p>
      </div>

      <LazyVSelectInput
        v-model="form.visibility"
        name="catVisibility"
        :label="$t('categories_ui.cat_visibility')"
        :options="visibilityOptions"
      />

      <div>
        <LazyVTextarea
          v-model="form.abstract"
          name="catAbstract"
          :label="$t('common_ui.description')"
          optional
          rows="4"
          maxlength="400"
        />
        <p class="mt-1 text-end font-mono text-2xs text-mute tabular-nums">
          {{ form.abstract.length }} / 400
        </p>
      </div>

      <fieldset class="space-y-3 rounded-card border border-line bg-ink p-3">
        <legend class="label-caps px-1">
          {{ $t('categories_ui.flags_legend') }}
        </legend>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span id="flag-index">{{ $t('categories_ui.flag_indexing') }}</span>
          <LazyVSwitch
            v-model="form.publicIndexing"
            :label="$t('categories_ui.flag_indexing')"
          />
        </div>

        <div class="flex items-center justify-between gap-3 text-sm">
          <span>{{ $t('categories_ui.flag_megamenu') }}</span>
          <LazyVSwitch
            v-model="form.megamenu"
            :label="$t('categories_ui.flag_megamenu')"
          />
        </div>

        <LazyVSelectInput
          v-model="form.facetRank"
          name="catFacet"
          :label="$t('categories_ui.facet_priority')"
          :options="facetOptions"
        />

        <LazyVSelectInput
          v-model="form.defaultSort"
          name="catSort"
          :label="$t('categories_ui.default_sort')"
          :options="sortOptions"
        />
      </fieldset>

      <figure class="rounded-card border border-line bg-ink p-3">
        <figcaption
          class="mb-1 flex items-center justify-between font-mono text-2xs uppercase text-mute"
        >
          <span>{{ $t('categories_ui.serp_preview') }}</span>
          <span class="tabular-nums">{{
            $t('categories_ui.serp_chars', { count: form.abstract.length, max: 160 })
          }}</span>
        </figcaption>
        <p class="truncate text-base font-medium text-cyan">
          {{ form.name || $t('categories_ui.cat_name') }}
        </p>
        <p class="truncate font-mono text-2xs text-mute" dir="ltr">
          https://printpro.com{{ form.slug }}
        </p>
        <p class="mt-1 line-clamp-2 text-xs text-mute">
          {{ form.abstract || $t('categories_ui.serp_abstract_fallback') }}
        </p>
      </figure>

      <p v-if="error" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ error }}
      </p>
    </form>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4"
    >
      <LazyVButton
        v-if="category"
        variant="tertiary"
        icon="lucide:trash-2"
        class="!text-accent"
        :disabled="saving"
        @click="emit('remove')"
        >{{ $t('categories_ui.delete_node') }}</LazyVButton
      >

      <span v-else />

      <LazyVButton
        type="submit"
        form="category-form"
        :loading="saving"
        icon="lucide:save"
        >{{ category ? $t("btn.save_changes") : $t("categories_ui.create_category") }}</LazyVButton
      >
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import {
  facetOptions,
  sortOptions,
  visibilityOptions,
} from "~/data/category-meta";
import type { Category, CategoryInput } from "~/types/admin/categories";

const props = defineProps<{
  /** The category being edited; null when creating. */
  category: Category | null;
  /** Parent preselected for a new sub-category. */
  newParentId?: string | null;
  masters: Category[];
  hasChildren?: boolean;
  saving?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  save: [values: CategoryInput];
  remove: [];
  close: [];
}>();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const { t } = useI18n();

const c = props.category;
const kindOptions = computed(() => [
  { value: "general", label: t("categories_ui.kind_general") },
  { value: "printer", label: t("categories_ui.kind_printer") },
  { value: "copier", label: t("categories_ui.kind_copier") },
  { value: "supply", label: t("categories_ui.kind_supply") },
]);

const kindLabel = computed(() => kindOptions.value.find((k) => k.value === props.category?.kind)?.label ?? "");

const form = reactive<CategoryInput>({
  key: "",
  kind: c?.kind ?? "general",
  name: c?.name ?? "",
  slug: c?.slug ?? "",
  parentId: c ? c.parentId : (props.newParentId ?? null),
  visibility: c?.visibility ?? "active",
  abstract: c?.abstract ?? "",
  megamenu: c?.megamenu ?? false,
  publicIndexing: c?.publicIndexing ?? true,
  facetRank: c?.facetRank ?? 3,
  defaultSort: c?.defaultSort ?? "curated",
});

const parentSlug = () =>
  props.masters.find((m) => m.id === form.parentId)?.slug ?? "";

// A new category's slug follows its name (under its parent) until someone edits it by hand.
const slugTouched = ref(!!c);

watch(
  () => [form.name, form.parentId],
  () => {
    if (!slugTouched.value)
      form.slug = `${parentSlug()}/${slugify(form.name)}`.replace(/\/$/, "");
  },
  { immediate: !c },
);

const { validate } = useForm();

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  emit("save", { ...form, key: form.key?.trim() || undefined, parentId: null });
};
</script>