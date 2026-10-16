<template>
  <div class="callout-accent" role="alert">
    <Icon
      name="lucide:circle-alert"
      size="16"
      class="bullet-icon"
      aria-hidden="true"
    />
    <div class="space-y-2">
      <p>
        <slot>{{ message }}</slot>
      </p>
      <LazyVButton
        size="sm"
        variant="secondary"
        icon="lucide:refresh-cw"
        @click="emit('retry')"
        >{{ retryLabel }}</LazyVButton
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * A contextual load error with a retry button (design.md §25): says what failed and
 * lets the user try again without replacing the whole page.
 *
 *   <LazyVErrorBanner message="The chart could not be loaded." @retry="refresh()" />
 */

withDefaults(defineProps<{ message?: string; retryLabel?: string }>(), {
  retryLabel: "Retry",
});

const emit = defineEmits<{ retry: [] }>();
</script>