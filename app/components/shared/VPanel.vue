<template>
  <section class="card flex flex-col" :aria-labelledby="id">
    <header
      class="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5"
    >
      <div class="min-w-0">
        <h2
          :id="id"
          class="flex items-center gap-2 font-display text-lg font-bold"
        >
          <Icon
            v-if="icon"
            :name="icon"
            size="18"
            :class="iconClass"
            aria-hidden="true"
          />
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-1 text-xs text-mute">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </header>
    <div class="flex-1" :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
/**
 * A titled dashboard section: heading, optional subtitle, optional actions slot.
 *
 *   <VPanel title="Orders" subtitle="Latest five" icon="lucide:receipt-text">
 *     <template #actions><LazyVButton size="sm">All</LazyVButton></template>
 *     …
 *   </VPanel>
 */

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    icon?: string;
    iconClass?: string;
    /** Body padding. Pass "" for edge-to-edge content such as tables. */
    bodyClass?: string;
  }>(),
  { iconClass: "text-accent", bodyClass: "p-4 sm:p-5" },
);

const id = useId();
</script>