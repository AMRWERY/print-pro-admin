<template>
  <article
    class="flex flex-col gap-3 rounded-card border bg-surface p-3 transition-colors duration-fast"
    :class="[
      selected ? 'border-accent bg-accent-soft' : 'border-line',
      state === 'out' && 'border-accent/40',
    ]"
  >
    <div class="flex items-start gap-3">
      <LazyVCheckboxImput
        :name="`pick-card-${product.id}`"
        :label="`Select ${product.name}`"
        hide-label
        size="sm"
        :model-value="selected"
        @update:model-value="emit('toggle')"
      />

      <LazyVIconTile :icon="product.icon" />

      <div class="min-w-0 flex-1">
        <p
          class="flex flex-wrap items-center gap-x-2 font-mono text-2xs text-mute"
          dir="ltr"
        >
          {{ product.sku }}
          <LazyVStatusBadge
            v-if="product.status !== 'active'"
            :tone="statusMeta[product.status].tone"
            :icon="statusMeta[product.status].icon"
            >{{ statusMeta[product.status].label }}</LazyVStatusBadge
          >
        </p>
        <h3 class="font-display text-base font-bold leading-snug">
          {{ product.name }}
        </h3>
        <p class="meta">
          {{ categoryMeta[product.category].label }} · {{ product.brand }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="font-mono text-base font-semibold tabular-nums">
        {{ currency(product.price, { maximumFractionDigits: 0 }) }}
      </p>
      <LazyVStatusBadge
        :tone="stockMeta[state].tone"
        :icon="stockMeta[state].icon"
      >
        Stock: {{ product.stock }} {{ product.unit
        }}{{ product.stock === 1 ? "" : "s" }}
      </LazyVStatusBadge>
    </div>

    <div
      class="flex items-center justify-between gap-2 border-t border-line pt-3"
    >
      <div
        class="flex items-center gap-1"
        role="group"
        :aria-label="`Adjust stock for ${product.name}`"
      >
        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:minus"
          aria-label="Decrease stock"
          :disabled="product.stock <= 0"
          @click="emit('stock', product.stock - 1)"
        />
        <span
          class="min-w-8 text-center font-mono text-sm tabular-nums"
          aria-live="polite"
          >{{ product.stock }}</span
        >

        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:plus"
          aria-label="Increase stock"
          @click="emit('stock', product.stock + 1)"
        />
      </div>
      <div class="flex items-center gap-1">
        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:pencil"
          :aria-label="`Edit ${product.name}`"
          @click="emit('edit')"
        />

        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:copy"
          :aria-label="`Duplicate ${product.name}`"
          @click="emit('duplicate')"
        />

        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:trash-2"
          :aria-label="`Delete ${product.name}`"
          class="hover:!border-accent hover:!text-accent"
          @click="emit('remove')"
        />
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import {
  categoryMeta,
  statusMeta,
  stockMeta,
  stockStateOf,
} from "~/data/product-meta";
import type { Product } from "~/types/admin/products";

const props = defineProps<{ product: Product; selected?: boolean }>();

const emit = defineEmits<{
  toggle: [];
  edit: [];
  duplicate: [];
  remove: [];
  stock: [value: number];
}>();

const { currency } = useFormatters();

const state = computed(() => stockStateOf(props.product));
</script>