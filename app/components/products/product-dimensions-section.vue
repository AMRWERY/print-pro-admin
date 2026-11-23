<template>
  <section id="dimensions" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="dimensions-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="dimensions-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:package" size="18" class="text-accent" aria-hidden="true" />
        06 // Dimensions & packaging
      </h2>
    </header>
    <div class="grid gap-4 sm:grid-cols-2">
      <LazyVInput
        v-model="form.massKg"
        name="massKg"
        type="number"
        label="Net mass (kg)"
        optional
        rules="min_value:0"
        min="0"
        step="0.01"
      />
      
      <LazyVInput
        v-model="form.hsCode"
        name="hsCode"
        label="Harmonized HS code"
        optional
        maxlength="20"
        input-class="font-mono"
      />
    </div>

    <fieldset class="mt-4">
      <legend class="label">External dimensions, L × W × H (mm)</legend>
      <div class="mt-1.5 grid grid-cols-3 gap-3">
        <LazyVInput
          v-model="form.dims.l"
          name="dimL"
          type="number"
          label="Length"
          hide-label
          min="0"
          placeholder="L"
        />

        <LazyVInput
          v-model="form.dims.w"
          name="dimW"
          type="number"
          label="Width"
          hide-label
          min="0"
          placeholder="W"
        />

        <LazyVInput
          v-model="form.dims.h"
          name="dimH"
          type="number"
          label="Height"
          hide-label
          min="0"
          placeholder="H"
        />
      </div>
    </fieldset>

    <fieldset class="mt-4">
      <legend class="label">Packaging</legend>
      <div class="mt-1.5 grid gap-3 sm:grid-cols-2">
        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="pallet"
          boxed
          label="Pallet and crate"
          description="Strapped pallet with a protective crate. Required for photocopiers and large-format printers."
        />

        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="standard"
          boxed
          label="Standard retail protection"
          description="Double-walled carton with foam inserts. Suitable for desktop printers and supplies."
        />
      </div>
    </fieldset>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>