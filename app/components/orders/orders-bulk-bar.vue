<template>
  <Transition name="fade">
    <div
      v-if="count"
      class="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4"
      role="region"
      aria-label="Bulk actions"
    >
      <div class="pointer-events-auto flex flex-wrap items-center gap-3 rounded-panel border border-accent/50 bg-raised px-4 py-2.5 shadow-2xl shadow-black/50">
        <p class="font-mono text-xs" aria-live="polite">
          <span class="font-bold tabular-nums">{{ count }}</span> selected
        </p>
        <LazyVButton size="sm" icon="lucide:download" @click="emit('export')">Export selected (CSV)</LazyVButton>
        <LazyVButton size="sm" variant="tertiary" @click="emit('clear')">Clear selection</LazyVButton>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
defineProps<{ count: number }>();
const emit = defineEmits<{ export: []; clear: [] }>();
</script>
