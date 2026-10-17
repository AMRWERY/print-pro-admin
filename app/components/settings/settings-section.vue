<template>
  <section
    :id="id"
    class="card scroll-mt-24 transition-colors duration-fast"
    :class="changed && 'border-yellow/60'"
    :aria-labelledby="`${id}-title`"
  >
    <header class="border-b border-line p-4 sm:p-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="label-caps text-accent">Domain {{ number }}</p>
        <LazyVStatusBadge v-if="changed" tone="warning" icon="lucide:pencil"
          >Unsaved changes</LazyVStatusBadge
        >
      </div>

      <h2
        :id="`${id}-title`"
        class="mt-1 font-display text-xl font-bold leading-tight"
      >
        {{ title }}
      </h2>

      <p v-if="description" class="meta mt-1 max-w-3xl">{{ description }}</p>
    </header>
    <div class="space-y-4 p-4 sm:p-5">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  id: string;
  /** Position in the list, shown as "Domain 03". */
  number: string;
  title: string;
  description?: string;
  /** This section has edits that are not saved yet. */
  changed?: boolean;
}>();
</script>