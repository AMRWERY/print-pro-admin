<template>
  <VPanel
    :title="t('dashboard_ui.best_selling_products')"
    :subtitle="t('dashboard_ui.best_selling_subtitle')"
    icon="lucide:trending-up"
    body-class=""
  >
    <div v-if="!items" class="space-y-3 p-4 sm:p-5" aria-busy="true">
      <LazyVSkeletonLoader v-for="n in 5" :key="n" class="h-12" />
    </div>

    <ol v-else class="divide-y divide-line">
      <li
        v-for="item in items"
        :key="item.rank"
        class="flex items-center gap-3 px-4 py-3 sm:px-5"
      >
        <span
          class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-mute"
          aria-hidden="true"
          >{{ item.rank }}</span
        >
        <LazyVIconTile :icon="item.icon" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ item.name }}</p>
          <p class="meta truncate">
            {{ item.volume }} {{ item.volumeUnit }} {{ t('dashboard_ui.sold') }} ·
            {{ currency(item.unitValue, { maximumFractionDigits: 0 }) }} {{ t('dashboard_ui.each') }}
          </p>
        </div>
        <p
          class="shrink-0 text-end font-mono text-sm font-semibold tabular-nums"
        >
          {{ compactCurrency(item.revenue) }}
        </p>
      </li>
    </ol>
  </VPanel>
</template>

<script lang="ts" setup>
import type { TopProduct } from "~/types/admin/dashboard";

defineProps<{ items?: TopProduct[] | null }>();

const { t } = useI18n();
const { currency, compactCurrency } = useFormatters();
</script>