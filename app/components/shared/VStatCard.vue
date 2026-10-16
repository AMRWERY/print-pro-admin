<template>
  <component
    :is="to ? NuxtLinkLocale : 'div'"
    v-bind="to ? { to } : {}"
    class="card flex h-full flex-col gap-2 p-4"
    :class="[
      borderClass[tone],
      to && 'transition duration-fast hover:bg-raised',
    ]"
    :aria-busy="loading || undefined"
  >
    <template v-if="loading">
      <LazyVSkeletonLoader variant="line" class="w-1/2" />

      <LazyVSkeletonLoader class="h-8 w-2/3" />

      <LazyVSkeletonLoader variant="line" class="w-3/4" />
    </template>

    <template v-else>
      <p class="flex items-start justify-between gap-2">
        <span class="label-caps">{{ label }}</span>
        <Icon
          v-if="icon"
          :name="icon"
          size="16"
          :class="iconClass[tone]"
          aria-hidden="true"
        />
      </p>
      <p
        class="flex flex-wrap items-baseline gap-x-2 font-display font-bold tabular-nums"
        :class="[size === 'lg' ? 'text-3xl' : 'text-2xl', valueClass[tone]]"
      >
        <slot name="value">{{ value }}</slot>
      </p>
      <slot />
      <p v-if="hint" class="text-xs text-mute">{{ hint }}</p>
    </template>
  </component>
</template>

<script lang="ts" setup>
/**
 * A summary figure: caps label, icon, big value, optional hint. The default slot adds
 * extras under the value (a trend badge, a sparkline). Pass `to` to make the whole
 * card a locale-aware link, `loading` for its skeleton.
 *
 *   <LazyVStatCard label="Orders" icon="lucide:receipt-text" value="1,284" hint="This month">
 *     <LazyVStatusBadge tone="success">+8.4%</LazyVStatusBadge>
 *   </LazyVStatCard>
 */

withDefaults(
  defineProps<{
    label?: string;
    value?: string | number;
    icon?: string;
    hint?: string;
    /** accent / warning tint the value, the icon and the leading edge. */
    tone?: "default" | "accent" | "warning";
    size?: "md" | "lg";
    to?: string;
    loading?: boolean;
  }>(),
  { tone: "default", size: "md" },
);

const NuxtLinkLocale = resolveComponent("NuxtLinkLocale");

const borderClass = {
  default: "",
  accent: "border-s-2 border-s-accent",
  warning: "border-s-2 border-s-yellow",
};
const iconClass = {
  default: "text-mute",
  accent: "text-accent",
  warning: "text-yellow",
};
const valueClass = {
  default: "",
  accent: "text-accent",
  warning: "text-yellow",
};
</script>