<template>
  <LazyVPanel
    id="pricing"
    title="03 // Pricing & escrow protocol"
    icon="lucide:banknote"
    class="scroll-mt-24"
  >
    <template #actions>
      <span class="chip">Currency: EUR</span>
    </template>

    <div class="grid gap-4 sm:grid-cols-3">
      <LazyVInput
        v-model="form.price"
        name="price"
        type="number"
        label="Listing price (EUR)"
        required
        rules="required|min_value:0"
        min="0"
        step="0.01"
      />

      <LazyVInput
        v-model="form.compareAt"
        name="compareAt"
        type="number"
        label="Compare-at price"
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
        label="Cost per unit (COGS)"
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
        <p class="label-caps">Estimated gross profit</p>
        <template v-if="profit !== null">
          <p
            class="font-display text-3xl font-bold tabular-nums"
            :class="profit >= 0 ? 'text-success' : 'text-accent'"
          >
            {{ currency(profit, cents) }}
            <span class="text-sm text-mute">/ unit</span>
          </p>
          <LazyVStatusBadge
            class="mt-1"
            :tone="
              margin! >= 20 ? 'success' : margin! >= 0 ? 'warning' : 'accent'
            "
            >{{ margin!.toFixed(1) }}% margin</LazyVStatusBadge
          >
        </template>

        <p v-else class="mt-1 text-sm text-mute">
          Enter a listing price and a cost per unit to see the margin.
        </p>
      </div>

      <div class="rounded-card border border-line bg-ink p-4">
        <LazyVCheckboxImput
          v-model="form.taxExempt"
          name="taxExempt"
          label="Exempt from VAT for verified institutional clients"
          description="Reverse charge applies to AAA-tier accounts. Escrow fee is waived at checkout."
        />
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

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
    ? `Shows a ${Math.round(((compare - price) / compare) * 100)}% saving`
    : "Shown struck through when higher than the listing price";
});
</script>