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
          :label="$t('inventory_ui.kpi_total_valuation')"
          icon="lucide:landmark"
          :value="
            currency(kpis.valuation, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="$t('inventory_ui.kpi_valuation_hint', { units: number(kpis.units), skus: number(kpis.skus) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('inventory_ui.kpi_healthy_reserves')"
          icon="lucide:circle-check"
          :hint="$t('inventory_ui.kpi_healthy_hint', { pct: percent(kpis.healthyPct) })"
        >
          <template #value
            >{{
              $t('inventory_ui.sku_count', { n: number(Math.round((kpis.healthyPct / 100) * kpis.skus)) })
            }}</template
          >

          <LazyVMeter
            :value="kpis.healthyPct"
            tone="success"
            :label="$t('inventory_ui.kpi_healthy_meter')"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="warning"
          :label="$t('inventory_ui.kpi_low_critical')"
          icon="lucide:triangle-alert"
          :value="$t('inventory_ui.sku_count', { n: number(kpis.low) })"
          :hint="$t('inventory_ui.kpi_low_hint')"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          tone="accent"
          :label="$t('inventory_ui.tab_out')"
          icon="lucide:circle-alert"
          :value="$t('inventory_ui.sku_count', { n: pad(kpis.out) })"
          :hint="$t('inventory_ui.kpi_restock_hint', { amount: currency(kpis.reorderValue, { maximumFractionDigits: 0 }) })"
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