<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <form role="search" class="sm:col-span-2 lg:col-span-1" @submit.prevent>
        <LazyVInput
          v-model="q"
          name="couponSearch"
          type="search"
          label="Search vouchers"
          hide-label
          icon="lucide:search"
          autocomplete="off"
          placeholder="Search code or campaign…"
        />
      </form>

      <LazyVSelectInput
        v-model="type"
        name="couponType"
        label="Type"
        hide-label
        :options="typeOptions"
      />

      <LazyVSelectInput
        v-model="tier"
        name="couponTier"
        label="Tier"
        hide-label
        :options="tierOptions"
      />

      <LazyVSelectInput
        v-model="sort"
        name="couponSort"
        label="Sort"
        hide-label
        :options="sortOptions"
      />
    </div>

    <div
      role="group"
      aria-label="Voucher status"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <button
        v-for="t in tabs"
        :key="t.value"
        type="button"
        class="shrink-0 whitespace-nowrap rounded-control border px-3 py-1.5 font-mono text-xs transition duration-fast active:scale-95"
        :class="
          tab === t.value
            ? 'border-accent bg-accent text-onaccent'
            : 'border-line bg-surface text-mute hover:border-accent/60 hover:text-paper'
        "
        :aria-pressed="tab === t.value"
        @click="tab = t.value"
      >
        {{ t.label }}
        <span class="tabular-nums"
          >({{ counts ? number(counts[t.value]) : "…" }})</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  sortOptions,
  tabs,
  tierOptions,
  typeOptions,
} from "~/data/coupon-meta";
import type {
  CouponSort,
  CouponTab,
  CouponTier,
  CouponType,
  CouponsResponse,
} from "~/types/admin/coupons";

defineProps<{ counts?: CouponsResponse["counts"] | null }>();

const q = defineModel<string>("q", { required: true });
const tab = defineModel<CouponTab>("tab", { required: true });
const type = defineModel<"all" | CouponType>("type", { required: true });
const tier = defineModel<CouponTier>("tier", { required: true });
const sort = defineModel<CouponSort>("sort", { required: true });

const { number } = useFormatters();
</script>