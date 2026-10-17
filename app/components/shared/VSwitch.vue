<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-40"
    :class="model ? 'border-accent bg-accent' : 'border-line bg-raised'"
    @click="model = !model"
  >
    <span
      class="inline-block h-4 w-4 rounded-full shadow transition-transform duration-fast"
      :class="
        model
          ? 'translate-x-6 bg-white rtl:-translate-x-6'
          : 'translate-x-1 bg-mute rtl:-translate-x-1'
      "
    />
  </button>
</template>

<script lang="ts" setup>
/**
 * On/off switch for settings that apply immediately. Give it an accessible `label`
 * (there is no visible text), and bind it with v-model.
 *
 *   <LazyVSwitch v-model="visible" label="Visible on the storefront" />
 */

defineProps<{ label: string; disabled?: boolean }>();

const model = defineModel<boolean>({ default: false });
</script>