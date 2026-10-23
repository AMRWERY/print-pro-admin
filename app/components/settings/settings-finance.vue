<template>
  <settings-section
    id="currency"
    number="03"
    title="Currency & multi-market FX"
    description="The base currency prices are held in, the currencies shown to visitors, and how often rates refresh."
    :changed="changed.includes('currency')"
  >
    <div class="grid gap-4 md:grid-cols-3">
      <LazyVSelectInput
        v-model="s.currency.base"
        name="baseCurrency"
        label="Base currency"
        :options="currencyOptions"
      />

      <LazyVSelectInput
        v-model="s.currency.secondary"
        name="secondaryCurrency"
        label="Secondary"
        :options="currencyOptions"
      />

      <LazyVSelectInput
        v-model="s.currency.tertiary"
        name="tertiaryCurrency"
        label="Tertiary"
        :options="currencyOptions"
      />
    </div>

    <p v-if="duplicate" class="callout-accent" role="alert">
      <Icon
        name="lucide:circle-alert"
        size="16"
        class="bullet-icon"
        aria-hidden="true"
      />
      Two of the three currencies are the same. Visitors will see the same price
      twice.
    </p>

    <div class="grid gap-4 md:grid-cols-3">
      <LazyVInput
        v-model="s.currency.syncMinutes"
        name="syncMinutes"
        type="number"
        label="Rate refresh (minutes)"
        required
        rules="required|integer|min_value:5|max_value:1440"
        min="5"
        max="1440"
      />

      <LazyVInput
        v-model="s.currency.markup"
        name="markup"
        type="number"
        label="FX margin (%)"
        required
        rules="required|min_value:0|max_value:10"
        min="0"
        max="10"
        step="0.1"
        hint="Added to the mid-market rate."
      />

      <LazyVSelectInput
        v-model="s.currency.rounding"
        name="rounding"
        label="Display rounding"
        :options="roundingOptions"
      />
    </div>
  </settings-section>

  <settings-section
    id="tax"
    number="04"
    title="Taxes & institutional exemptions"
    description="Rates by jurisdiction and the rules for exempt and cross-border sales."
    :changed="changed.includes('tax')"
  >
    <LazyVInput
      v-model="s.tax.vatId"
      name="vatId"
      label="VAT / tax identification number"
      optional
      maxlength="30"
      input-class="font-mono uppercase"
      class="md:max-w-sm"
      dir="ltr"
    />

    <!-- Rates: a table on wide screens, stacked cards on phones -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full min-w-[34rem] border-collapse text-sm">
        <caption class="sr-only">
          Tax rates by jurisdiction
        </caption>
        <thead>
          <tr class="border-b border-line">
            <th scope="col" class="label-caps py-2 pe-3 text-start">
              Jurisdiction
            </th>
            <th scope="col" class="label-caps py-2 pe-3 text-start">
              Mechanism
            </th>
            <th scope="col" class="label-caps w-28 py-2 pe-3 text-start">
              Standard %
            </th>
            <th scope="col" class="label-caps w-28 py-2 pe-3 text-start">
              Reduced %
            </th>
            <th scope="col" class="label-caps w-20 py-2 text-center">Active</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(r, i) in s.tax.rows"
            :key="r.id"
            class="border-b border-line align-top"
          >
            <th scope="row" class="py-2 pe-3 text-start font-medium">
              {{ r.jurisdiction }}
            </th>
            <td class="meta py-2 pe-3">{{ r.mechanism }}</td>
            <td class="py-2 pe-3">
              <LazyVInput
                v-model="r.standard"
                :name="`taxStandard${i}`"
                type="number"
                :label="`${r.jurisdiction} standard rate`"
                hide-label
                rules="required|min_value:0|max_value:100"
                step="0.1"
              />
            </td>
            <td class="py-2 pe-3">
              <LazyVInput
                v-model="r.reduced"
                :name="`taxReduced${i}`"
                type="number"
                :label="`${r.jurisdiction} reduced rate`"
                hide-label
                :rules="reducedRule(r)"
                step="0.1"
              />
            </td>
            <td class="py-3 text-center">
              <LazyVSwitch
                v-model="r.active"
                :label="`Charge tax in ${r.jurisdiction}`"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ul class="space-y-3 md:hidden">
      <li
        v-for="(r, i) in s.tax.rows"
        :key="r.id"
        class="rounded-card border border-line bg-ink/40 p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">{{ r.jurisdiction }}</p>
            <p class="meta">{{ r.mechanism }}</p>
          </div>
          <LazyVSwitch
            v-model="r.active"
            :label="`Charge tax in ${r.jurisdiction}`"
          />
        </div>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <LazyVInput
            v-model="r.standard"
            :name="`mTaxStandard${i}`"
            type="number"
            label="Standard %"
            rules="required|min_value:0|max_value:100"
            step="0.1"
          />

          <LazyVInput
            v-model="r.reduced"
            :name="`mTaxReduced${i}`"
            type="number"
            label="Reduced %"
            :rules="reducedRule(r)"
            step="0.1"
          />
        </div>
      </li>
    </ul>

    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.tax.ossConsolidation"
        title="One-stop-shop consolidation"
        description="Report EU distance sales through a single quarterly return."
      />

      <settings-toggle
        v-model="s.tax.zeroRating"
        title="Zero-rate qualifying customers"
        description="Customers with a valid tax exemption certificate pay no tax."
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import { currencyOptions, roundingOptions } from "~/data/settings-meta";
import type { Settings, SettingsKey, TaxRow } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{ changed: SettingsKey[] }>();

const duplicate = computed(() => {
  const { base, secondary, tertiary } = s.value.currency;
  return new Set([base, secondary, tertiary]).size < 3;
});

// The reduced rate can't be higher than the standard one.
const reducedRule = (r: TaxRow) => (v: unknown) => {
  const n = Number(v);
  if (v === "" || v === null || Number.isNaN(n))
    return "Enter a rate, or 0 for none.";
  if (n < 0 || n > 100) return "A rate is between 0 and 100.";
  return n <= Number(r.standard)
    ? true
    : "The reduced rate can't be higher than the standard rate.";
};
</script>