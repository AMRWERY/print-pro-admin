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
        :label="$t('products_ui.select_product', { name: product.name })"
        hide-label
        size="sm"
        :model-value="selected"
        @update:model-value="emit('toggle')"
      />

      <product-thumb :product="product" />

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
          {{ categories.label(product.category) }} · {{ product.brand }}
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
        {{ $t('products_ui.stock_badge', { qty: qty(product) }) }}
      </LazyVStatusBadge>
    </div>

    <div
      class="flex items-center justify-between gap-2 border-t border-line pt-3"
    >
      <div
        class="flex items-center gap-1"
        role="group"
        :aria-label="$t('products_ui.adjust_stock_for', { name: product.name })"
      >
        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:minus"
          :aria-label="$t('products_ui.decrease_stock')"
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
          :aria-label="$t('products_ui.increase_stock')"
          @click="emit('stock', product.stock + 1)"
        />
      </div>

      <LazyVRowActions
        :label="$t('products_ui.actions_for', { name: product.name })"
        duplicate
        @edit="emit('edit')"
        @duplicate="emit('duplicate')"
        @remove="emit('remove')"
      />
    </div>
  </article>
</template>

<script lang="ts" setup>
import {
  statusMeta,
  stockMeta,
  stockStateOf,
} from "~/data/product-meta";
import type { Product } from "~/types/admin/products";

const { t } = useI18n();
const categories = useCategories();

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

const qty = (p: Product) =>
  t(`products_ui.qty_${p.unit}_${p.stock === 1 ? "one" : "other"}`, { count: p.stock });
</script>