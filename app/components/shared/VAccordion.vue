<template>
  <div v-reveal class="flex flex-wrap items-end justify-between gap-4">
    <div class="max-w-2xl space-y-2">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h2 :id="id" class="text-3xl">{{ title }}</h2>
      <p v-if="body" class="text-sm text-mute">{{ body }}</p>
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  eyebrow: string;
  title: string;
  body?: string;
  id?: string;
}>();
</script>