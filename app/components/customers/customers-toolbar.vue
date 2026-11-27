<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="customerSearch"
          type="search"
          :label="$t('customers_ui.search_clients')"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          :placeholder="$t('customers_ui.search_placeholder')"
        />
      </form>

      <LazyVSelectInput
        v-model="status"
        name="customerStatus"
        :label="$t('common_ui.status')"
        hide-label
        :options="statusOptions"
      />

      <LazyVSelectInput
        v-model="activity"
        name="customerActivity"
        :label="$t('customers_ui.activity')"
        hide-label
        :options="activityOptions"
      />

      <LazyVSelectInput
        v-model="sort"
        name="customerSort"
        :label="$t('customers_ui.sort')"
        hide-label
        :options="sortOptions"
      />
    </div>

    <div
      role="group"
      :aria-label="$t('customers_ui.client_segment')"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95"
        :class="
          segment === tab.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        :aria-pressed="segment === tab.value"
        @click="segment = tab.value"
      >
        {{ tab.label }}
        <span class="tabular-nums"
          >({{ counts ? number(counts[tab.value]) : "…" }})</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { segmentMeta } from "~/data/customer-meta";
import type {
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomersResponse,
} from "~/types/admin/customers";

defineProps<{ counts?: CustomersResponse["counts"] | null }>();

const q = defineModel<string>("q", { required: true });
const segment = defineModel<"all" | CustomerSegment>("segment", {
  required: true,
});
const status = defineModel<"all" | CustomerStatus>("status", {
  required: true,
});
const activity = defineModel<CustomerActivity>("activity", { required: true });
const sort = defineModel<CustomerSort>("sort", { required: true });

const { t } = useI18n();
const { number } = useFormatters();

const statusOptions = computed<{ value: "all" | CustomerStatus; label: string }[]>(() => [
  { value: "all", label: t("customers_ui.status_all") },
  { value: "active", label: t("customers_ui.status_active") },
  { value: "audit", label: t("customers_ui.status_audit") },
  { value: "dormant", label: t("customers_ui.status_dormant") },
]);

const activityOptions = computed<{ value: CustomerActivity; label: string }[]>(() => [
  { value: "all", label: t("customers_ui.activity_all") },
  { value: "7d", label: t("customers_ui.activity_7d") },
  { value: "30d", label: t("customers_ui.activity_30d") },
  { value: "90d", label: t("customers_ui.activity_90d") },
]);

const sortOptions = computed<{ value: CustomerSort; label: string }[]>(() => [
  { value: "spend", label: t("customers_ui.sort_spend") },
  { value: "spendLow", label: t("customers_ui.sort_spend_low") },
  { value: "name", label: t("customers_ui.sort_name") },
  { value: "newest", label: t("customers_ui.sort_newest") },
]);

const segmentLabel = computed<Record<CustomerSegment, string>>(() => ({
  enterprise: t("customers_ui.segment_enterprise"),
  business: t("customers_ui.segment_business"),
  printShop: t("customers_ui.segment_print_shop"),
  home: t("customers_ui.segment_home"),
  highLtv: t("customers_ui.segment_high_ltv"),
}));

const tabs = computed(() => [
  { value: "all" as const, label: t("customers_ui.all_clients") },
  ...(Object.keys(segmentMeta) as CustomerSegment[]).map((value) => ({
    value,
    label: segmentLabel.value[value],
  })),
]);
</script>