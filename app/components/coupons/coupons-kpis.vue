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
          label="Cumulative discount escrow"
          icon="lucide:landmark"
          :value="
            currency(kpis.escrowValue, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
          :hint="`Across ${number(kpis.redemptions)} redemptions`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Active vouchers"
          icon="lucide:ticket-percent"
          :value="number(kpis.active)"
          :hint="`${kpis.singleUse} single-use, ${kpis.tiered} public or tiered · ${percent(kpis.allocatedPct)} allocated`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total redemptions"
          icon="lucide:badge-check"
          :value="number(kpis.redemptions)"
          :hint="`${percent(kpis.capPct)} of the ${number(kpis.capTotal)} cap`"
        >
          <LazyVMeter
            :value="kpis.capPct"
            tone="accent"
            label="Share of the total redemption cap used"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :tone="kpis.alerts ? 'accent' : 'default'"
          label="Depleted or expiring soon"
          icon="lucide:triangle-alert"
          :value="`${pad(kpis.alerts)} alerts`"
          :hint="`${kpis.depleted} reached their cap · ${kpis.expiringSoon} expiring within 48h`"
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