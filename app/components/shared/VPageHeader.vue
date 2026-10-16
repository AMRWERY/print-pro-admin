<template>
  <header class="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
    <div class="min-w-0 max-w-2xl space-y-2">
      <LazyVBreadcrumb v-if="breadcrumb" :items="breadcrumb" />

      <h1 class="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {{ title }}
      </h1>
      <slot name="meta" />
      <p v-if="description" class="text-sm text-mute">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from "~/types/shared/VBreadcrumb";

/**
 * The title block at the top of an admin page.
 *
 *   <VPageHeader title="Orders" description="…" :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Orders' }]">
 *     <template #meta><span class="chip">…</span></template>
 *     <template #actions><LazyVButton>New</LazyVButton></template>
 *   </VPageHeader>
 */

defineProps<{
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
}>();
</script>