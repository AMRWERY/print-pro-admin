<template>
  <div
    role="radiogroup"
    :aria-label="label"
    class="inline-flex flex-wrap rounded-control border border-line bg-surface p-0.5"
  >
    <label v-for="option in options" :key="option.value" class="cursor-pointer">
      <input
        type="radio"
        class="peer sr-only"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="emit('update:modelValue', option.value)"
      />
      <span
        class="block rounded-tight px-3 py-1.5 font-mono text-xs text-mute transition duration-fast peer-checked:bg-accent peer-checked:text-onaccent peer-focus-visible:ring-2 peer-focus-visible:ring-cyan [input:not(:checked)+&]:hover:bg-raised [input:not(:checked)+&]:hover:text-paper"
        >{{ option.label }}</span
      >
    </label>
  </div>
</template>

<script lang="ts" setup generic="T extends string">
/**
 * Single-choice pill group built on native radios, so arrow keys, focus and
 * screen-reader semantics come for free.
 *
 *   <LazyVSegmented v-model="range" label="Period" :options="[{ value: 'week', label: '7d' }]" />
 */

defineProps<{
  modelValue: T;
  options: { value: T; label: string }[];
  label: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: T] }>();

const name = useId();
</script>