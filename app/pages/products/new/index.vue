<template>
  <product-editor
    v-if="initial"
    mode="create"
    :initial="initial"
  />
  <div v-else class="space-y-4" aria-busy="true">
    <LazyVSkeletonLoader variant="line" class="w-64" />
   
    <LazyVSkeletonLoader class="h-96" />
  </div>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const { t } = useI18n();
const route = useRoute();

const from = typeof route.query.from === "string" ? route.query.from : "";

const blank = (): ProductFormValues => ({
  name: "",
  sku: "",
  category: "printers",
  brand: "",
  price: null as unknown as number,
  stock: 0,
  min: 1,
  status: "active",
  slug: "",
  description: "",
  media: [],
  compareAt: null,
  cost: null,
  taxExempt: false,
  specs: [],
  massKg: null,
  dims: { l: null, w: null, h: null },
  hsCode: "",
  packaging: "pallet",
  publication: "published",
  channels: ["storefront"],
  subType: "",
  collections: [],
  tags: [],
  bundled: [],
});

const initial = ref<ProductFormValues | null>(from ? null : blank());

// "Duplicate" arrives as ?from=<id>: start from a copy that needs its own SKU.
if (from) {
  try {
    const source = await useProductsStore().loadDetail(String(from));
    const {
      id: _id,
      tag: _tag,
      spec: _spec,
      serial: _serial,
      unit: _unit,
      icon: _icon,
      revisions: _rev,
      ...rest
    } = source;
    initial.value = {
      ...rest,
      name: t("products_ui.copy_name", { name: source.name }),
      sku: `${source.sku}-COPY`,
      slug: `${source.slug}-copy`,
      publication: "published",
    };
  } catch {
    initial.value = blank();
  }
}

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('products_ui.editor_create_title'),
  description: () => t('products_ui.editor_desc'),
});
</script>