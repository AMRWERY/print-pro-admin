<template>
  <section id="dimensions" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="dimensions-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="dimensions-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:package" size="18" class="text-accent" aria-hidden="true" />
        06 // {{ $t('products_ui.sec_dimensions') }}
      </h2>
    </header>
    <div class="grid gap-4 sm:grid-cols-2">
      <LazyVInput
        v-model="form.massKg"
        name="massKg"
        type="number"
        :label="$t('products_ui.net_mass_kg')"
        optional
        rules="min_value:0"
        min="0"
        step="0.01"
      />
      
      <LazyVInput
        v-model="form.hsCode"
        name="hsCode"
        :label="$t('products_ui.dim_hs_code')"
        optional
        maxlength="20"
        input-class="font-mono"
      />
    </div>

    <fieldset class="mt-4">
      <legend class="label">{{ $t('products_ui.external_dimensions') }}</legend>
      <div class="mt-1.5 grid grid-cols-3 gap-3">
        <LazyVInput
          v-model="form.dims.l"
          name="dimL"
          type="number"
          :label="$t('products_ui.length')"
          hide-label
          min="0"
          :placeholder="$t('products_ui.length_short')"
        />

        <LazyVInput
          v-model="form.dims.w"
          name="dimW"
          type="number"
          :label="$t('products_ui.width')"
          hide-label
          min="0"
          :placeholder="$t('products_ui.width_short')"
        />

        <LazyVInput
          v-model="form.dims.h"
          name="dimH"
          type="number"
          :label="$t('products_ui.height')"
          hide-label
          min="0"
          :placeholder="$t('products_ui.height_short')"
        />
      </div>
    </fieldset>

    <fieldset class="mt-4">
      <legend class="label">{{ $t('products_ui.packaging') }}</legend>
      <div class="mt-1.5 grid gap-3 sm:grid-cols-2">
        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="pallet"
          boxed
          :label="$t('products_ui.pallet_crate')"
          :description="$t('products_ui.pallet_crate_desc')"
        />

        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="standard"
          boxed
          :label="$t('products_ui.standard_protection')"
          :description="$t('products_ui.standard_protection_desc')"
        />
      </div>
    </fieldset>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>