<template>
  <ul
    class="grid grid-cols-2 gap-3 xl:grid-cols-4"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li v-for="n in 4" :key="n"><LazyVStatCard loading /></li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total valuation"
          icon="lucide:landmark"
          :value="
            currency(kpis.valuation, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="`${number(kpis.units)} units across ${number(kpis.skus)} SKUs`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Healthy reserves"
          icon="lucide:circle-check"
          :hint="`${percent(kpis.healthyPct)} at a nominal level`"
        >
          <template #value
            >{{
              number(Math.round((kpis.healthyPct / 100) * kpis.skus))
            }}
            SKUs</template
          >

          <LazyVMeter
            :value="kpis.healthyPct"
            tone="success"
            label="Share of SKUs with healthy stock"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          label="Low stock, critical"
          icon="lucide:triangle-alert"
          :value="`${number(kpis.low)} SKUs`"
          hint="At or below their reorder point"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="accent"
          label="Out of stock"
          icon="lucide:circle-alert"
          :value="`${pad(kpis.out)} SKUs`"
          :hint="`${currency(kpis.reorderValue, { maximumFractionDigits: 0 })} to restock`"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { InventoryResponse } from "~/types/admin/inventory";

defineProps<{ kpis?: InventoryResponse["kpis"] | null }>();

const { number, currency, percent } = useFormatters();

const pad = (n: number) => String(n).padStart(2, "0");
</script>