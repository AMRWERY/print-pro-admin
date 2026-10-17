<template>
  <LazyVPanel
    :title="category ? 'Category inspector' : 'New category'"
    :subtitle="
      category
        ? `${category.code}`
        : parentName
          ? `Sub-category of ${parentName}`
          : 'Top-level category'
    "
    :icon="category ? 'lucide:folder-tree' : 'lucide:folder-plus'"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        aria-label="Close inspector"
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
        label="Category name"
        required
        rules="required|min:2|max:80"
        maxlength="80"
      />

      <LazyVInput
        v-model="form.slug"
        name="catSlug"
        label="Canonical URL slug"
        required
        rules="required|min:2|max:120"
        input-class="font-mono"
        hint="Lowercase letters, numbers, dashes and slashes."
        @update:model-value="slugTouched = true"
      />

      <LazyVSelectInput
        :model-value="form.parentId ?? ''"
        name="catParent"
        @update:model-value="(v) => (form.parentId = v ? String(v) : null)"
        label="Parent category node"
        :options="parentOptions"
        :disabled="hasChildren"
        :hint="
          hasChildren
            ? 'A category with sub-categories stays top-level.'
            : undefined
        "
      />

      <LazyVSelectInput
        v-model="form.visibility"
        name="catVisibility"
        label="Storefront visibility"
        :options="visibilityOptions"
      />

      <div>
        <LazyVTextarea
          v-model="form.abstract"
          name="catAbstract"
          label="Curatorial abstract"
          optional
          rows="4"
          maxlength="400"
        />
        <p class="mt-1 text-end font-mono text-2xs text-mute tabular-nums">
          {{ form.abstract.length }} / 400
        </p>
      </div>

      <fieldset class="space-y-3 rounded-card border border-line bg-ink p-3">
        <legend class="label-caps px-1">Storefront & megamenu flags</legend>
        <div class="flex items-center justify-between gap-3 text-sm">
          <span id="flag-index">Storefront public indexing</span>
          <LazyVSwitch
            v-model="form.publicIndexing"
            label="Storefront public indexing"
          />
        </div>

        <div class="flex items-center justify-between gap-3 text-sm">
          <span>Feature on nav megamenu</span>
          <LazyVSwitch
            v-model="form.megamenu"
            label="Feature on nav megamenu"
          />
        </div>

        <LazyVSelectInput
          v-model="form.facetRank"
          name="catFacet"
          label="Filter facet priority"
          :options="facetOptions"
        />

        <LazyVSelectInput
          v-model="form.defaultSort"
          name="catSort"
          label="Default storefront sort"
          :options="sortOptions"
        />
      </fieldset>

      <figure class="rounded-card border border-line bg-ink p-3">
        <figcaption
          class="mb-1 flex items-center justify-between font-mono text-2xs uppercase text-mute"
        >
          <span>SERP preview</span>
          <span class="tabular-nums">{{ form.abstract.length }}/160 chars</span>
        </figcaption>
        <p class="truncate text-base font-medium text-cyan">
          {{ form.name || "Category name" }}
        </p>
        <p class="truncate font-mono text-2xs text-mute" dir="ltr">
          https://lumenpress.com{{ form.slug }}
        </p>
        <p class="mt-1 line-clamp-2 text-xs text-mute">
          {{ form.abstract || "The abstract appears here." }}
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
        >Delete node</LazyVButton
      >

      <span v-else />

      <LazyVButton
        type="submit"
        form="category-form"
        :loading="saving"
        icon="lucide:save"
        >{{ category ? "Save changes" : "Create category" }}</LazyVButton
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

const c = props.category;
const form = reactive<CategoryInput>({
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

const parentName = computed(
  () => props.masters.find((m) => m.id === form.parentId)?.name,
);

const parentOptions = computed(() => [
  { value: "", label: "Root (top level, no parent)" },
  ...props.masters
    .filter((m) => m.id !== props.category?.id)
    .map((m) => ({ value: m.id, label: m.name })),
]);

const { validate } = useForm();

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  emit("save", { ...form, parentId: form.parentId || null });
};
</script>