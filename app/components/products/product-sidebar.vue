<template>
  <div class="space-y-4">
    <!-- The whole column stays in view while the page scrolls. If it is taller than the screen, it scrolls on its own. -->
    <div class="space-y-4 xl:sticky xl:top-24 xl:z-10 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:overscroll-contain">
      <LazyVPanel
      title="Curatorial status"
      icon="lucide:eye"
    >
      <div class="space-y-4">
        <LazyVSelectInput
          v-model="form.publication"
          name="publication"
          label="Publication status"
          :options="publicationOptions"
        />
        <fieldset>
          <legend class="label">Distribution channels</legend>
          <div class="mt-1.5 space-y-2">
            <LazyVCheckboxImput
              v-for="c in channels"
              :key="c.value"
              v-model="form.channels"
              :name="`channel-${c.value}`"
              :value="c.value"
              :label="c.label"
              size="sm"
            />
          </div>
        </fieldset>
        <LazyVSelectInput
          v-model="form.status"
          name="benchStatus"
          label="Bench metrology status"
          :options="statusOptions"
        />
      </div>
    </LazyVPanel>

      <LazyVPanel title="Compatible media & chemistry" icon="lucide:link-2">
      <template #actions>
        <span class="chip">{{ form.bundled.length }} paired</span>
      </template>
      <p v-if="!bundledOptions.length" class="text-sm text-mute">
        No pairable items found.
      </p>
      <ul class="space-y-2">
        <li
          v-for="p in bundledOptions"
          :key="p.id"
          class="rounded-card border border-line bg-ink p-2.5"
        >
          <LazyVCheckboxImput
            v-model="form.bundled"
            :name="`bundle-${p.id}`"
            :value="p.id"
            size="sm"
          >
            <span class="block text-sm font-medium leading-snug">{{
              p.name
            }}</span>
            <span class="meta"
              >{{ currency(p.price, { maximumFractionDigits: 0 }) }} ·
              {{ p.stock }} in stock</span
            >
          </LazyVCheckboxImput>
        </li>
      </ul>
    </LazyVPanel>

    <LazyVPanel title="Taxonomy & provenance" icon="lucide:tag">
      <div class="space-y-4">
        <LazyVSelectInput
          v-model="form.category"
          name="category"
          label="Primary classification"
          required
          rules="required"
          :options="categoryChoices"
        />

        <LazyVInput
          v-model="form.subType"
          name="subType"
          label="Apparatus sub-type"
          optional
          maxlength="80"
        />

        <LazyVInput
          v-model="form.brand"
          name="brand"
          label="Foundry / brand"
          required
          rules="required|min:2|max:60"
          maxlength="60"
        />

        <LazyVChipsInput
          v-model="form.collections"
          label="Curated collections"
          placeholder="Add a collection"
          :max="10"
        />

        <LazyVChipsInput
          v-model="form.tags"
          label="Archival search tags"
          placeholder="#tag"
          :max="15"
        />
      </div>
    </LazyVPanel>

    <LazyVPanel title="Ledger audit trail" icon="lucide:history">
      <template #actions>
        <span class="chip">{{ revisions.length }} revisions</span>
      </template>
      <ol class="space-y-3">
        <li v-for="(r, i) in revisions" :key="r.rev" class="text-sm">
          <p class="flex flex-wrap items-center gap-2 font-mono text-xs">
            Rev {{ r.rev }}
            <LazyVStatusBadge v-if="i === 0" tone="success"
              >Current</LazyVStatusBadge
            >
          </p>
          <p class="text-mute">{{ r.note }}</p>
          <p class="meta" dir="ltr">{{ formatUtc(r.at) }} · {{ r.by }}</p>
        </li>
      </ol>
    </LazyVPanel>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { categoryMeta, statusMeta } from "~/data/product-meta";
import type {
  Product,
  ProductCategory,
  ProductFormValues,
  ProductRevision,
  ProductStatus,
} from "~/types/admin/products";

defineProps<{
  form: ProductFormValues;
  revisions: ProductRevision[];
  bundledOptions: Product[];
}>();

const { currency } = useFormatters();

const publicationOptions = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Active and available for requisition" },
  { value: "archived", label: "Archived" },
];

const channels = [
  { value: "storefront", label: "Online flagship storefront" },
  { value: "institutional", label: "Institutional requisitions catalog" },
  { value: "printLab", label: "Commercial print lab portal" },
  { value: "depot", label: "Frankfurt depot POS node" },
  { value: "vip", label: "VIP private treaty vault only" },
];

const categoryChoices = (Object.keys(categoryMeta) as ProductCategory[]).map(
  (value) => ({
    value,
    label: categoryMeta[value].label,
  }),
);

const statusOptions = (Object.keys(statusMeta) as ProductStatus[]).map(
  (value) => ({
    value,
    label: statusMeta[value].label,
  }),
);
</script>