<template>
  <LazyVPanel
    id="seo"
    title="08 // Search engine live preview"
    icon="lucide:search"
    class="scroll-mt-24"
  >
    <figure class="rounded-card border border-line bg-ink p-4">
      <figcaption class="label-caps mb-2">Search result preview</figcaption>
      <p class="truncate font-mono text-xs text-mute" dir="ltr">
        https://printpro.com › products › {{ form.slug || "…" }}
      </p>
      <p class="mt-1 text-lg font-medium leading-snug text-cyan">
        {{ form.seoTitle || form.name || "Product title" }}
      </p>
      <p class="mt-1 text-sm text-mute">
        {{
          form.seoDescription ||
          form.excerpt ||
          "The meta description appears here."
        }}
      </p>
    </figure>

    <div class="mt-4 space-y-4">
      <div>
        <LazyVInput
          v-model="form.seoTitle"
          name="seoTitle"
          label="Search engine title tag"
          optional
          maxlength="70"
        />
        <p
          class="mt-1 text-end font-mono text-2xs tabular-nums"
          :class="form.seoTitle.length > 60 ? 'text-yellow' : 'text-mute'"
        >
          {{ form.seoTitle.length }} / 70 chars
        </p>
      </div>
      <div>
        <LazyVTextarea
          v-model="form.seoDescription"
          name="seoDescription"
          label="Meta description"
          optional
          rows="3"
          maxlength="160"
        />
        <p
          class="mt-1 text-end font-mono text-2xs tabular-nums"
          :class="
            form.seoDescription.length > 150 ? 'text-yellow' : 'text-mute'
          "
        >
          {{ form.seoDescription.length }} / 160 chars
        </p>
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>