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
          :label="$t('coupons_ui.kpi_total_discount_value')"
          icon="lucide:landmark"
          :value="
            currency(kpis.discountValue, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="$t('coupons_ui.kpi_across_redemptions', { count: number(kpis.redemptions) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('coupons_ui.kpi_active_vouchers')"
          icon="lucide:ticket-percent"
          :value="number(kpis.active)"
          :hint="$t('coupons_ui.kpi_active_hint', { singleUse: kpis.singleUse, tiered: kpis.tiered, percent: percent(kpis.allocatedPct) })"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :label="$t('coupons_ui.kpi_total_claims')"
          icon="lucide:badge-check"
          :value="number(kpis.redemptions)"
          :hint="$t('coupons_ui.kpi_cap_hint', { percent: percent(kpis.capPct), total: number(kpis.capTotal) })"
        >
          <LazyVMeter
            :value="kpis.capPct"
            tone="accent"
            :label="$t('coupons_ui.kpi_cap_meter')"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :tone="kpis.alerts ? 'accent' : 'default'"
          :label="$t('coupons_ui.kpi_alerts_label')"
          icon="lucide:triangle-alert"
          :value="$t('coupons_ui.kpi_alerts_value', { count: pad(kpis.alerts) })"
          :hint="$t('coupons_ui.kpi_alerts_hint', { depleted: kpis.depleted, expiring: kpis.expiringSoon })"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { CouponsResponse } from "~/types/admin/coupons";

defineProps<{ kpis?: CouponsResponse["kpis"] | null }>();

const { number, currency, percent } = useFormatters();

const pad = (n: number) => String(n).padStart(2, "0");
</script>