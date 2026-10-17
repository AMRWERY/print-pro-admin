<template>
  <LazyVPanel
    title="Category turnover & margin matrix"
    subtitle="Revenue share and margin by division"
    icon="lucide:chart-column"
  >
    <div v-if="!categories" class="space-y-3" aria-busy="true">
      <LazyVSkeletonLoader class="h-3" />
      <LazyVSkeletonLoader v-for="n in 5" :key="n" class="h-12" />
    </div>

    <template v-else>
      <div
        class="flex h-3 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label="Revenue share by division"
      >
        <span
          v-for="(c, i) in categories"
          :key="c.category"
          class="h-full"
          :class="swatch[i]"
          :style="{ width: `${c.share}%` }"
        />
      </div>

      <ul class="mt-4 space-y-3">
        <li
          v-for="(c, i) in categories"
          :key="c.category"
          class="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="swatch[i]"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1 basis-44">
            <p class="font-medium leading-snug">
              {{ categoryMeta[c.category].label }}
            </p>
            <p class="meta">
              {{ percent(c.share) }} share ·
              <span class="text-success">{{ signedPercent(c.yoy) }} YoY</span>
            </p>
          </div>
          <div class="text-end">
            <p class="font-mono text-sm font-semibold tabular-nums">
              {{ currency(c.revenue, { maximumFractionDigits: 0 }) }}
            </p>
            <LazyVStatusBadge :tone="c.margin >= 40 ? 'success' : 'neutral'"
              >Margin {{ percent(c.margin) }}</LazyVStatusBadge
            >
          </div>
        </li>
      </ul>

      <p
        class="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3 font-mono text-xs text-mute"
      >
        <span>Portfolio weighted margin</span>
        <span class="font-semibold text-paper"
          >{{ percent(portfolioMargin) }} net margin</span
        >
      </p>
    </template>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { categoryMeta } from "~/data/product-meta";
import type { CategoryRow } from "~/types/admin/analytics";

defineProps<{ categories?: CategoryRow[] | null; portfolioMargin: number }>();

const { currency, percent, signedPercent } = useFormatters();

// Fixed order of swatches, so a division keeps its colour as the numbers change.
const swatch = ["bg-accent", "bg-yellow", "bg-cyan", "bg-success", "bg-mute"];
</script>