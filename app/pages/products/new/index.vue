<template>
  <product-editor
    v-if="initial"
    mode="create"
    :initial="initial"
    :revisions="[]"
  />
  <div v-else class="space-y-4" aria-busy="true">
    <LazyVSkeletonLoader variant="line" class="w-64" />
    <LazyVSkeletonLoader class="h-96" />
  </div>
</template>

<script lang="ts" setup>
import { buildVariants } from "~/utils/product-variants";
import type { ProductDetail, ProductFormValues } from "~/types/admin/products";

const route = useRoute();
const from = typeof route.query.from === "string" ? route.query.from : "";

const blank = (): ProductFormValues => ({
  name: "",
  sku: "",
  category: "cameras",
  brand: "",
  price: null as unknown as number,
  stock: 0,
  min: 1,
  status: "active",
  slug: "",
  description: "",
  excerpt: "",
  media: [],
  compareAt: null,
  cost: null,
  taxExempt: false,
  backorder: "notify",
  axes: [],
  variants: buildVariants([], 0),
  specs: [],
  massKg: null,
  dims: { l: null, w: null, h: null },
  hsCode: "",
  packaging: "climate",
  seoTitle: "",
  seoDescription: "",
  publication: "draft",
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
    const source = await $fetch<ProductDetail>(`/api/admin/products/${from}`);
    const {
      id: _id,
      ean: _ean,
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
      name: `${source.name} (copy)`,
      sku: `${source.sku}-COPY`,
      slug: `${source.slug}-copy`,
      publication: "draft",
    };
  } catch {
    initial.value = blank();
  }
}

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Add product",
  description: "Register a new product or SKU.",
});
</script>