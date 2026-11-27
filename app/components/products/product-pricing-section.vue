<template>
  <section id="pricing" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="pricing-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="pricing-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:banknote" size="18" class="text-accent" aria-hidden="true" />
        03 // {{ $t('products_ui.pricing') }}
      </h2>
      <div class="shrink-0"><span class="chip">{{ $t('products_ui.currency_egp') }}</span></div>
    </header>

    <div class="grid gap-4 sm:grid-cols-3">
      <LazyVInput
        v-model="form.price"
        name="price"
        type="number"
        :label="$t('products_ui.listing_price_egp')"
        required
        rules="required|min_value:0"
        min="0"
        step="0.01"
      />

      <LazyVInput
        v-model="form.compareAt"
        name="compareAt"
        type="number"
        :label="$t('products_ui.compare_at_price')"
        optional
        rules="min_value:0"
        min="0"
        step="0.01"
        :hint="saving"
      />

      <LazyVInput
        v-model="form.cost"
        name="cost"
        type="number"
        :label="$t('products_ui.cost_per_unit')"
        optional
        rules="min_value:0"
        min="0"
        step="0.01"
      />
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div
        class="rounded-card border border-line bg-ink p-4"
        aria-live="polite"
      >
        <p class="label-caps">{{ $t('products_ui.estimated_gross_profit') }}</p>
        <template v-if="profit !== null">
          <p
            class="font-display text-3xl font-bold tabular-nums"
            :class="profit >= 0 ? 'text-success' : 'text-accent'"
          >
            {{ currency(profit, cents) }}
            <span class="text-sm text-mute">{{ $t('products_ui.per_unit') }}</span>
          </p>
          <LazyVStatusBadge
            class="mt-1"
            :tone="
              margin! >= 20 ? 'success' : margin! >= 0 ? 'warning' : 'accent'
            "
            >{{ $t('products_ui.margin_pct', { pct: margin!.toFixed(1) }) }}</LazyVStatusBadge
          >
        </template>

        <p v-else class="mt-1 text-sm text-mute">
          {{ $t('products_ui.margin_empty') }}
        </p>
      </div>

      <div class="rounded-card border border-line bg-ink p-4">
        <LazyVCheckboxImput
          v-model="form.taxExempt"
          name="taxExempt"
          :label="$t('products_ui.vat_exempt')"
          :description="$t('products_ui.vat_exempt_desc')"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

const { t } = useI18n();
const { currency } = useFormatters();

const cents = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const profit = computed(() => {
  const price = num(props.form.price);
  const cost = num(props.form.cost);
  return price !== null && cost !== null && price > 0 ? price - cost : null;
});
const margin = computed(() =>
  profit.value !== null
    ? (profit.value / Number(props.form.price)) * 100
    : null,
);

const saving = computed(() => {
  const price = num(props.form.price);
  const compare = num(props.form.compareAt);
  return price && compare && compare > price
    ? t("products_ui.saving_shows", { pct: Math.round(((compare - price) / compare) * 100) })
    : t("products_ui.saving_hint");
});
</script>