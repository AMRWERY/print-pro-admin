<template>
  <VPanel
    :title="t('dashboard_ui.recent_customers')"
    :subtitle="t('dashboard_ui.recent_customers_subtitle')"
    icon="lucide:users"
  >
    <template #actions>
      <LazyVButton
        variant="tertiary"
        size="sm"
        to="/customers"
        icon-end="lucide:arrow-up-right"
        icon-end-class="rtl:-scale-x-100"
        >{{ t('btn.all_customers') }}</LazyVButton
      >
    </template>

    <ul class="space-y-3" :aria-busy="!items || undefined">
      <template v-if="!items">
        <li v-for="n in 4" :key="n"><LazyVSkeletonLoader class="h-16" /></li>
      </template>

      <li
        v-for="customer in items ?? []"
        :key="customer.name"
        class="flex items-center gap-3 rounded-card border border-line bg-ink p-3"
      >
        <LazyVAvatar :initials="customer.initials" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ customer.name }}</p>
          <p class="meta truncate">{{ customer.location }}</p>
        </div>
        <div class="shrink-0 text-end">
          <p class="font-mono text-sm font-semibold tabular-nums">
            {{ currency(customer.lifetimeValue, { maximumFractionDigits: 0 }) }}
          </p>
          <p class="meta">{{ tierText[customer.tier] }}</p>
        </div>
      </li>
    </ul>
  </VPanel>
</template>

<script lang="ts" setup>
import type { RecentCustomer } from "~/types/admin/dashboard";

defineProps<{ items?: RecentCustomer[] | null }>();

const { t } = useI18n();
const { currency } = useFormatters();

const tierText = computed<Record<RecentCustomer["tier"], string>>(() => ({
  enterprise: t("customers_ui.segment_enterprise"),
  business: t("customers_ui.segment_business"),
  printShop: t("customers_ui.segment_print_shop"),
  home: t("customers_ui.segment_home"),
}));
</script>