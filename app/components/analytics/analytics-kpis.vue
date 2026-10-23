<template>
  <ul
    class="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li
        v-for="n in 5"
        :key="n"
        :class="n === 5 && 'col-span-2 lg:col-span-1'"
      >
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Gross turnover"
          icon="lucide:banknote"
          :value="
            currency(kpis.turnover, {
              maximumFractionDigits: 0,
              notation: 'compact',
            })
          "
        >
          <p
            class="flex flex-wrap items-center gap-2 font-mono text-2xs text-mute"
          >
            <LazyVStatusBadge
              :tone="kpis.turnoverDelta >= 0 ? 'success' : 'accent'"
              :icon="
                kpis.turnoverDelta >= 0
                  ? 'lucide:trending-up'
                  : 'lucide:trending-down'
              "
              >{{ signedPercent(kpis.turnoverDelta) }}</LazyVStatusBadge
            >
            vs previous period
          </p>

          <dashboard-sparkline :values="kpis.trend" />

          <p class="meta">
            Change {{ kpis.turnoverChange >= 0 ? "+" : "−"
            }}{{
              currency(Math.abs(kpis.turnoverChange), {
                maximumFractionDigits: 0,
                notation: "compact",
              })
            }}
          </p>
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Orders"
          icon="lucide:shopping-cart"
          :value="number(kpis.orders)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.ordersDelta) }}</LazyVStatusBadge
          >
          <p class="meta">{{ number(kpis.inProgress) }} in progress</p>
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Average order value"
          icon="lucide:receipt-text"
          :value="currency(kpis.aov)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.aovDelta) }}</LazyVStatusBadge
          >
          <p class="meta">Machine and supply mix</p>
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Storefront conversion"
          icon="lucide:funnel"
          :value="percent(kpis.conversion, 2)"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.conversionDelta, 2) }}</LazyVStatusBadge
          >
          <p class="meta">{{ number(kpis.sessions) }} sessions</p>
        </LazyVStatCard>
      </li>
      <li class="col-span-2 lg:col-span-1">
        <LazyVStatCard
          size="lg"
          label="New business customers"
          icon="lucide:badge-check"
          :value="`+${number(kpis.intake)}`"
        >
          <LazyVStatusBadge
            class="self-start"
            tone="success"
            icon="lucide:trending-up"
            >{{ signedPercent(kpis.intakeDelta) }}</LazyVStatusBadge
          >
          <p class="meta">Verified businesses and schools</p>
        </LazyVStatCard>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { AnalyticsKpis } from "~/types/admin/analytics";

defineProps<{ kpis?: AnalyticsKpis | null }>();

const { number, currency, percent, signedPercent } = useFormatters();
</script>