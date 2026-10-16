<template>
  <LazyVPanel
    id="identity"
    title="01 // Identity & curatorial prose"
    icon="lucide:file-text"
    class="scroll-mt-24"
  >
    <div class="space-y-4">
      <LazyVInput
        v-model="form.name"
        name="name"
        label="Product title"
        required
        rules="required|min:2|max:120"
        maxlength="120"
      />

      <div>
        <LazyVInput
          v-model="form.slug"
          name="slug"
          label="Permanent handle / URI"
          rules="required|min:2|max:80"
          input-class="font-mono"
          @update:model-value="slugTouched = true"
        />
        <p class="meta mt-1 break-all" dir="ltr">
          https://lumenpress.com/products/{{ form.slug || "…" }}
        </p>
      </div>

      <div ref="editor">
        <p class="label">Technical & curatorial dossier</p>
        <div class="mt-1.5 overflow-hidden rounded-control border border-line">
          <div
            class="flex flex-wrap items-center gap-1 border-b border-line bg-ink p-1.5"
            role="toolbar"
            aria-label="Text formatting"
          >
            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:bold"
              aria-label="Bold"
              @click="wrap('**', '**', 'bold text')"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:italic"
              aria-label="Italic"
              @click="wrap('_', '_', 'italic text')"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:list"
              aria-label="Bulleted list"
              @click="wrap('\n- ', '', 'list item')"
            />

            <LazyVButton
              variant="icon"
              size="sm"
              icon="lucide:link"
              aria-label="Link"
              @click="wrap('[', '](https://)', 'link text')"
            />
            <span class="ms-auto me-2 font-mono text-2xs text-mute tabular-nums"
              >{{ form.description.length }} / 4000</span
            >
          </div>

          <LazyVTextarea
            v-model="form.description"
            name="description"
            label="Dossier text"
            hide-label
            rows="8"
            maxlength="4000"
            input-class="!rounded-none !border-0 !ring-0"
          />
        </div>
      </div>

      <div>
        <LazyVTextarea
          v-model="form.excerpt"
          name="excerpt"
          label="Short curator excerpt (catalog card)"
          optional
          rows="2"
          maxlength="300"
        />
        <p class="mt-1 text-end font-mono text-2xs text-mute tabular-nums">
          {{ form.excerpt.length }} / 300
        </p>
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{
  form: ProductFormValues;
  mode: "create" | "edit";
}>();

const editor = ref<HTMLElement | null>(null);

// In create mode the handle follows the title until someone edits the handle by hand.
const slugTouched = ref(props.mode === "edit");

watch(
  () => props.form.name,
  (name) => {
    if (slugTouched.value) return;
    props.form.slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  },
);

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