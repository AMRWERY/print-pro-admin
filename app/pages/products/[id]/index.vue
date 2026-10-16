<template>
  <LazyVEmptyState
    v-if="notFound"
    icon="lucide:search-x"
    title="Product not found"
    description="This product is not in the register. It may have been deleted."
    eyebrow="REGISTER :: NOT_FOUND"
    tag="404"
    tag-tone="accent"
  >
    <LazyVButton
      to="/products"
      icon="lucide:arrow-left"
      icon-class="rtl:-scale-x-100"
      >Back to products</LazyVButton
    >
  </LazyVEmptyState>

  <LazyVErrorBanner
    v-else-if="error"
    message="This product could not be loaded. Check your connection and try again."
    @retry="() => refresh()"
  />

  <product-editor
    v-else-if="detail"
    :key="detail.id"
    mode="edit"
    :initial="initial"
    :product-id="detail.id"
    :ean="detail.ean"
    :revisions="detail.revisions"
    @saved="() => refresh()"
  />

  <div v-else class="space-y-4" aria-busy="true">
    <LazyVSkeletonLoader variant="line" class="w-64" />

    <LazyVSkeletonLoader class="h-10 w-1/2" />

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div class="space-y-4">
        <LazyVSkeletonLoader class="h-72" /><LazyVSkeletonLoader class="h-60" />
      </div>
      <LazyVSkeletonLoader class="h-96" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ProductDetail, ProductFormValues } from "~/types/admin/products";

const route = useRoute();
const id = computed(() => String(route.params.id));

const {
  data: detail,
  error,
  refresh,
} = useFetch<ProductDetail>(() => `/api/admin/products/${id.value}`, {
  lazy: true,
});

const notFound = computed(() => error.value?.statusCode === 404);

// Only the form's fields go to the editor; the rest (EAN, revisions…) are display-only.
const initial = computed<ProductFormValues>(() => {
  const d = detail.value!;
  return {
    name: d.name,
    sku: d.sku,
    category: d.category,
    brand: d.brand,
    price: d.price,
    stock: d.stock,
    min: d.min,
    status: d.status,
    slug: d.slug,
    description: d.description,
    excerpt: d.excerpt,
    media: d.media,
    compareAt: d.compareAt,
    cost: d.cost,
    taxExempt: d.taxExempt,
    backorder: d.backorder,
    axes: d.axes,
    variants: d.variants,
    specs: d.specs,
    massKg: d.massKg,
    dims: d.dims,
    hsCode: d.hsCode,
    packaging: d.packaging,
    seoTitle: d.seoTitle,
    seoDescription: d.seoDescription,
    publication: d.publication,
    channels: d.channels,
    subType: d.subType,
    collections: d.collections,
    tags: d.tags,
    bundled: d.bundled,
  };
});

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => (detail.value ? `Edit ${detail.value.name}` : "Edit product"),
  description:
    "Edit a product's details, pricing, inventory, variants and search listing.",
});
</script>