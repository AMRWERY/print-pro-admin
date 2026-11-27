<template>
  <LazyVEmptyState
    v-if="notFound"
    icon="lucide:search-x"
    :title="$t('products_ui.product_not_found')"
    :description="$t('products_ui.product_not_found_desc')"
    eyebrow="REGISTER :: NOT_FOUND"
    tag="404"
    tag-tone="accent"
  >
    <LazyVButton
      to="/products"
      icon="lucide:arrow-left"
      icon-class="rtl:-scale-x-100"
      >{{ $t('products_ui.back_to_products') }}</LazyVButton
    >
  </LazyVEmptyState>

  <LazyVErrorBanner
    v-else-if="error"
    :message="$t('products_ui.product_load_error')"
    @retry="() => refresh()"
  />

  <product-editor
    v-else-if="detail"
    :key="detail.id"
    mode="edit"
    :initial="initial"
    :product-id="detail.id"
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
import type { ProductFormValues } from "~/types/admin/products";

const { t } = useI18n();
const route = useRoute();
const id = computed(() => String(route.params.id));

const store = useProductsStore();
const { detail, detailError: error } = storeToRefs(store);
const refresh = () => store.refreshDetail();

watch(id, (v) => store.fetchDetail(v), { immediate: true });

const notFound = computed(() => !!error.value && statusOf(error.value) === 404);

// Only the form's fields go to the editor; the rest (revisions…) are display-only.
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
    media: d.media,
    compareAt: d.compareAt,
    cost: d.cost,
    taxExempt: d.taxExempt,
    specs: d.specs,
    massKg: d.massKg,
    dims: d.dims,
    hsCode: d.hsCode,
    packaging: d.packaging,
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
  title: () => (detail.value ? t('products_ui.editor_edit_title', { name: detail.value.name }) : t('products_ui.edit_product')),
  description: () => t('products_ui.edit_product_desc'),
});
</script>