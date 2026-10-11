<template>
  <div
    class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <div v-for="n in 4" :key="n" class="card space-y-4 p-4 sm:p-5">
        <LazyVSkeletonLoader variant="line" class="w-1/2" />
        <LazyVSkeletonLoader class="h-9 w-2/3" />
        <LazyVSkeletonLoader class="h-10" />
        <LazyVSkeletonLoader variant="text" :lines="2" />
      </div>
    </template>

    <template v-else>
      <!-- Fiscal gross volume -->
      <article class="card flex flex-col gap-3 p-4 sm:p-5" aria-labelledby="kpi-gross">
        <header class="flex items-start justify-between gap-2">
          <h3 id="kpi-gross" class="label-caps">{{ $t("dashboard.kpi.gross.label") }}</h3>
          <VStatusBadge tone="success" icon="lucide:trending-up">{{
            signedPercent(kpis.gross.delta)
          }}</VStatusBadge>
        </header>
        <p class="font-display text-3xl font-bold tabular-nums">
          {{ currency(kpis.gross.value) }}
        </p>
        <p class="text-xs text-mute">
          {{ $t("dashboard.kpi.gross.usd", { usd: currency(kpis.gross.usdEquivalent, { currency: "USD", maximumFractionDigits: 0 }) }) }}
        </p>
        <DashboardSparkline :values="kpis.gross.trend" />
        <dl class="grid grid-cols-3 gap-2 border-t border-line pt-3">
          <div v-for="part in kpis.gross.breakdown" :key="part.key">
            <dt class="label-caps truncate">{{ $t(`dashboard.kpi.gross.${part.key}`) }}</dt>
            <dd class="font-mono text-xs font-semibold tabular-nums">
              {{ compactCurrency(part.value) }}
            </dd>
          </div>
        </dl>
      </article>

      <!-- Studio requisitions -->
      <article class="card flex flex-col gap-3 p-4 sm:p-5" aria-labelledby="kpi-req">
        <header class="flex items-start justify-between gap-2">
          <h3 id="kpi-req" class="label-caps">{{ $t("dashboard.kpi.requisitions.label") }}</h3>
          <VStatusBadge tone="success" icon="lucide:trending-up">{{
            signedPercent(kpis.requisitions.delta)
          }}</VStatusBadge>
        </header>
        <p class="font-display text-3xl font-bold tabular-nums">
          {{ number(kpis.requisitions.value) }}
          <span class="text-sm font-medium text-mute">{{ $t("dashboard.kpi.requisitions.unit") }}</span>
        </p>
        <p class="text-xs text-mute">
          {{ $t("dashboard.kpi.requisitions.basket", { value: currency(kpis.requisitions.averageBasket) }) }}
        </p>
        <div class="mt-auto space-y-2 border-t border-line pt-3">
          <div class="flex items-center justify-between text-xs">
            <span class="label-caps">{{ $t("dashboard.kpi.requisitions.clearing") }}</span>
            <span class="font-mono font-semibold tabular-nums">{{ percent(kpis.requisitions.clearingPct) }}</span>
          </div>
          <VMeter
            :value="kpis.requisitions.clearingPct"
            tone="success"
            :label="$t('dashboard.kpi.requisitions.clearing')"
          />
          <p class="flex justify-between font-mono text-2xs text-mute">
            <span>{{ $t("dashboard.kpi.requisitions.settled", { n: number(kpis.requisitions.settled) }) }}</span>
            <span class="text-yellow">{{ $t("dashboard.kpi.requisitions.held", { n: number(kpis.requisitions.held) }) }}</span>
          </p>
        </div>
      </article>

      <!-- Verified ateliers -->
      <article class="card flex flex-col gap-3 p-4 sm:p-5" aria-labelledby="kpi-ateliers">
        <header class="flex items-start justify-between gap-2">
          <h3 id="kpi-ateliers" class="label-caps">{{ $t("dashboard.kpi.ateliers.label") }}</h3>
          <VStatusBadge tone="success" icon="lucide:trending-up">{{
            `+${number(kpis.ateliers.delta)}`
          }}</VStatusBadge>
        </header>
        <p class="font-display text-3xl font-bold tabular-nums">
          {{ number(kpis.ateliers.value) }}
          <span class="text-sm font-medium text-mute">{{ $t("dashboard.kpi.ateliers.unit") }}</span>
        </p>
        <p class="text-xs text-mute">
          {{ $t("dashboard.kpi.ateliers.retention", { value: percent(kpis.ateliers.retentionPct) }) }}
        </p>
        <div class="mt-auto space-y-2 border-t border-line pt-3">
          <div
            class="flex h-1.5 gap-0.5 overflow-hidden rounded-full"
            role="img"
            :aria-label="$t('dashboard.kpi.ateliers.tiers')"
          >
            <span
              v-for="(tier, i) in kpis.ateliers.tiers"
              :key="tier.key"
              class="h-full"
              :class="tierBar[i]"
              :style="{ width: `${tier.pct}%` }"
            />
          </div>
          <ul class="flex flex-wrap gap-x-3 gap-y-1 font-mono text-2xs text-mute">
            <li v-for="(tier, i) in kpis.ateliers.tiers" :key="tier.key" class="flex items-center gap-1">
              <span class="h-2 w-2 rounded-full" :class="tierBar[i]" aria-hidden="true" />
              {{ $t(`dashboard.kpi.ateliers.${tier.key}`) }} {{ tier.pct }}%
            </li>
          </ul>
          <p class="flex justify-between font-mono text-2xs text-mute">
            <span>{{ $t("dashboard.kpi.ateliers.contracts", { n: number(kpis.ateliers.activeContracts) }) }}</span>
            <span class="text-success">{{ $t("dashboard.kpi.ateliers.rating", { value: kpis.ateliers.rating }) }}</span>
          </p>
        </div>
      </article>

      <!-- Depot catalog SKUs -->
      <article class="card flex flex-col gap-3 p-4 sm:p-5" aria-labelledby="kpi-skus">
        <header class="flex items-start justify-between gap-2">
          <h3 id="kpi-skus" class="label-caps">{{ $t("dashboard.kpi.skus.label") }}</h3>
          <VStatusBadge tone="accent" icon="lucide:triangle-alert">{{
            $t("dashboard.kpi.skus.alerts", { n: kpis.skus.alerts })
          }}</VStatusBadge>
        </header>
        <p class="font-display text-3xl font-bold tabular-nums">
          {{ number(kpis.skus.value) }}
          <span class="text-sm font-medium text-mute">{{ $t("dashboard.kpi.skus.unit") }}</span>
        </p>
        <p class="text-xs text-mute">
          {{ $t("dashboard.kpi.skus.divisions", { n: kpis.skus.divisions }) }}
        </p>
        <dl class="mt-auto grid grid-cols-5 gap-1 border-t border-line pt-3">
          <div v-for="part in kpis.skus.mix" :key="part.key" class="min-w-0">
            <dt class="label-caps truncate">{{ $t(`dashboard.kpi.skus.${part.key}`) }}</dt>
            <dd class="font-mono text-xs font-semibold tabular-nums">{{ compact(part.value) }}</dd>
          </div>
        </dl>
        <p class="font-mono text-2xs text-mute">
          {{ $t("dashboard.kpi.skus.lead", { n: kpis.skus.leadTimeHours }) }}
        </p>
      </article>
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { DashboardKpis } from "~/types/admin/dashboard";

defineProps<{ kpis?: DashboardKpis | null }>();

const { number, currency, compactCurrency, compact, percent, signedPercent } =
  useFormatters();

const tierBar = ["bg-accent", "bg-yellow", "bg-cyan"];
</script>
