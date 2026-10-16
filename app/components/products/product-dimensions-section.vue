<template>
  <LazyVPanel
    id="dimensions"
    title="07 // Dimensions & escrow crating"
    icon="lucide:package"
    class="scroll-mt-24"
  >
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
      <legend class="label">Custody & packaging protocol</legend>
      <div class="mt-1.5 grid gap-3 sm:grid-cols-2">
        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="climate"
          boxed
          label="Climate-controlled crate"
          description="Shock-absorbing timber flight crate with humidity control. Required for optics."
        />

        <LazyVRadioInput
          v-model="form.packaging"
          name="packaging"
          value="standard"
          boxed
          label="Standard retail protection"
          description="Double-walled carton with foam inserts. Not for lenses or sensors."
        />
      </div>
    </fieldset>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

defineProps<{ form: ProductFormValues }>();
</script>