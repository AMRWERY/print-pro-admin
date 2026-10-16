<template>
  <LazyVPanel
    id="specs"
    title="06 // Optical bench specifications"
    icon="lucide:gauge"
    class="scroll-mt-24"
  >
    <template #actions>
      <LazyVButton
        variant="secondary"
        size="sm"
        icon="lucide:plus"
        :disabled="form.specs.length >= 30"
        @click="add"
        >Add metrology parameter</LazyVButton
      >
    </template>

    <p v-if="!form.specs.length" class="callout">
      <Icon
        name="lucide:info"
        size="14"
        class="bullet-icon"
        aria-hidden="true"
      />
      <span
        >No specifications yet. Add the parameters customers compare, such as
        sensor size, resolution or Dmax.</span
      >
    </p>

    <ul class="space-y-2">
      <li
        v-for="(spec, i) in form.specs"
        :key="i"
        class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
      >
        <label class="min-w-0">
          <span class="sr-only">Parameter {{ i + 1 }} name</span>
          <input
            v-model="spec.key"
            type="text"
            class="field"
            placeholder="Parameter"
            maxlength="60"
          />
        </label>
        <label
          class="order-last col-span-2 min-w-0 sm:order-none sm:col-span-1"
        >
          <span class="sr-only">Parameter {{ i + 1 }} value</span>
          <input
            v-model="spec.value"
            type="text"
            class="field"
            placeholder="Value"
            maxlength="200"
          />
        </label>
        <LazyVButton
          variant="icon"
          icon="lucide:trash-2"
          :aria-label="`Remove ${spec.key || `parameter ${i + 1}`}`"
          class="hover:!border-accent hover:!text-accent"
          @click="form.specs.splice(i, 1)"
        />
      </li>
    </ul>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

const add = () => props.form.specs.push({ key: "", value: "" });
</script>