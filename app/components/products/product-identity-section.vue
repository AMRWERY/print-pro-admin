<template>
  <section id="identity" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="identity-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="identity-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:file-text" size="18" class="text-accent" aria-hidden="true" />
        01 // {{ $t('products_ui.heading_identity') }}
      </h2>
    </header>
    <div class="space-y-4">
      <LazyVInput
        v-model="form.name"
        name="name"
        :label="$t('products_ui.product_title')"
        required
        rules="required|min:2|max:120"
        maxlength="120"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVSelectInput
          v-model="form.category"
          name="category"
          :label="$t('products_ui.field_category')"
          required
          rules="required"
          :options="categoryChoices"
        />

        <LazyVInput
          v-model="form.brand"
          name="brand"
          :label="$t('products_ui.brand')"
          required
          rules="required|min:2|max:60"
          maxlength="60"
        />
      </div>

      <div ref="editor">
        <p class="label">{{ $t('common_ui.description') }}</p>
        <div class="mt-1.5 overflow-hidden rounded-control border border-line">
          <div
            class="flex flex-wrap items-center gap-1 border-b border-line bg-ink p-1.5"
            role="toolbar"
            :aria-label="$t('products_ui.text_formatting')"
          >
            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:bold"
              :aria-label="$t('products_ui.bold')"
              @click="wrap('**', '**', t('products_ui.placeholder_bold'))"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:italic"
              :aria-label="$t('products_ui.italic')"
              @click="wrap('_', '_', t('products_ui.placeholder_italic'))"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:list"
              :aria-label="$t('products_ui.bulleted_list')"
              @click="wrap('\n- ', '', t('products_ui.placeholder_list_item'))"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:link"
              :aria-label="$t('products_ui.link')"
              @click="wrap('[', '](https://)', t('products_ui.placeholder_link_text'))"
            />
            <span class="ms-auto me-2 font-mono text-2xs text-mute tabular-nums"
              >{{ form.description.length }} / 4000</span
            >
          </div>

          <LazyVTextarea
            v-model="form.description"
            name="description"
            :label="$t('common_ui.description')"
            hide-label
            rows="8"
            maxlength="4000"
            input-class="!rounded-none !border-0 !ring-0"
          />
        </div>
      </div>

    </div>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const { t } = useI18n();
const categories = useCategories();

const props = defineProps<{ form: ProductFormValues }>();

const editor = ref<HTMLElement | null>(null);

const categoryChoices = computed(() => categories.options());

// Wraps the selected text (or a placeholder) in markdown syntax.
const wrap = (before: string, after: string, placeholder: string) => {
  const el = editor.value?.querySelector("textarea");
  if (!el) return;
  const { selectionStart: a, selectionEnd: b, value } = el;
  const chosen = value.slice(a, b) || placeholder;
  props.form.description =
    `${value.slice(0, a)}${before}${chosen}${after}${value.slice(b)}`.slice(
      0,
      4000,
    );
  nextTick(() => {
    el.focus();
    el.setSelectionRange(a + before.length, a + before.length + chosen.length);
  });
};
</script>