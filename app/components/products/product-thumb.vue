<template>
  <img
    v-if="product.cover"
    :src="product.cover"
    alt=""
    width="56"
    height="56"
    loading="lazy"
    decoding="async"
    class="h-14 w-14 shrink-0 rounded-control border border-line bg-raised object-cover"
  />
  <LazyVIconTile v-else :icon="product.icon" />
</template>

<script lang="ts" setup>
import type { Product } from "~/types/admin/products";

/** A product's cover photo as a small square, or its category icon when it has no photo. Decorative: the name sits beside it. */
defineProps<{ product: Pick<Product, "cover" | "icon"> }>();
</script>
