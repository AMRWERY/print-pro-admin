<template>
  <ul
    class="grid grid-cols-2 gap-3 xl:grid-cols-4"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li v-for="n in 4" :key="n">
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Live storefront slots"
          icon="lucide:layout-panel-top"
          :value="`${number(kpis.live)} / ${number(kpis.slotCap)}`"
          :hint="`${number(kpis.slotCap - kpis.live)} slots open`"
        >
          <LazyVMeter
            :value="(kpis.live / kpis.slotCap) * 100"
            :tone="kpis.live >= kpis.slotCap ? 'accent' : 'success'"
            label="Share of storefront slots in use"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Scheduled campaigns"
          icon="lucide:calendar-clock"
          :value="pad(kpis.scheduled)"
          :hint="
            kpis.nextTitle
              ? `Next: ${kpis.nextTitle} · ${inDays(kpis.nextInDays)}`
              : 'Nothing scheduled'
          "
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Click-through rate"
          icon="lucide:mouse-pointer-click"
          :value="percent(kpis.ctr, 2)"
          :hint="`${signedPercent(kpis.ctrDelta, 2)} vs baseline${kpis.topTitle ? ` · top: ${percent(kpis.topCtr)}` : ''}`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :tone="kpis.attention ? 'accent' : 'default'"
          label="Needs attention"
          icon="lucide:triangle-alert"
          :value="`${pad(kpis.attention)} items`"
          :hint="`${kpis.expiringSoon} ending within 3 days · ${kpis.incomplete} missing alt text`"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { BlocksResponse } from "~/types/admin/content";

defineProps<{ kpis?: BlocksResponse["kpis"] | null }>();

const { number, percent, signedPercent } = useFormatters();

const pad = (n: number) => String(n).padStart(2, "0");

const inDays = (d: number | null) =>
  d === null ? "" : d <= 0 ? "today" : `in ${d} day${d === 1 ? "" : "s"}`;
</script>