<template>
  <section id="inventory" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="inventory-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="inventory-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:warehouse" size="18" class="text-accent" aria-hidden="true" />
        04 // {{ $t('nav.inventory') }}
      </h2>
    </header>
    <div class="grid gap-4 sm:grid-cols-2">
      <LazyVInput
        v-model="form.sku"
        name="sku"
        class="sm:col-span-2"
        :label="$t('products_ui.col_sku')"
        required
        rules="required|min:3|max:31|regex:^[A-Za-z0-9][A-Za-z0-9-]*$"
        :hint="$t('products_ui.sku_hint')"
        input-class="font-mono uppercase"
      />

      <LazyVInput
        v-model="form.stock"
        name="stock"
        type="number"
        :label="$t('products_ui.stock_on_hand')"
        required
        rules="required|integer|min_value:0"
        min="0"
      />

      <LazyVInput
        v-model="form.min"
        name="min"
        type="number"
        :label="$t('products_ui.low_stock_trigger')"
        required
        rules="required|integer|min_value:0"
        min="0"
        :hint="$t('products_ui.low_stock_hint')"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>
