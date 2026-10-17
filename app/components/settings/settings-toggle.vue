<template>
  <div
    class="flex items-start justify-between gap-4 rounded-card border border-line bg-ink/40 p-3"
  >
    <div class="min-w-0">
      <p :id="labelId" class="text-sm font-medium">{{ title }}</p>
      <p v-if="description" class="meta mt-0.5">{{ description }}</p>
    </div>

    <LazyVSwitch v-model="model" :label="title" :disabled="disabled" />
  </div>
</template>

<script lang="ts" setup>
/**
 * A setting that is on or off: title and explanation on the left, the switch on the right.
 *
 *   <settings-toggle v-model="s.security.requireFido2" title="Require hardware keys" description="…" />
 */

defineProps<{ title: string; description?: string; disabled?: boolean }>();

const model = defineModel<boolean>({ default: false });

const labelId = useId();
</script>