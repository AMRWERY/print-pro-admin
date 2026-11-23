<template>
  <section id="inventory" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="inventory-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="inventory-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:warehouse" size="18" class="text-accent" aria-hidden="true" />
        04 // Inventory
      </h2>
    </header>
    <div class="grid gap-4 sm:grid-cols-2">
      <LazyVInput
        v-model="form.sku"
        name="sku"
        class="sm:col-span-2"
        label="SKU"
        required
        rules="required|min:3|max:31|regex:^[A-Za-z0-9][A-Za-z0-9-]*$"
        hint="Letters, numbers and dashes. Must be unique."
        input-class="font-mono uppercase"
      />

      <LazyVInput
        v-model="form.stock"
        name="stock"
        type="number"
        label="Stock on hand"
        required
        rules="required|integer|min_value:0"
        min="0"
      />

      <LazyVInput
        v-model="form.min"
        name="min"
        type="number"
        label="Low-stock alert trigger"
        required
        rules="required|integer|min_value:0"
        min="0"
        hint="At or below this the product shows as low stock."
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>
