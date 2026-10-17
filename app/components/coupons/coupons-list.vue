<template>
  <div :aria-busy="loading || undefined">
    <ul v-if="loading" class="space-y-2 p-4 sm:p-5">
      <li v-for="n in Math.min(perPage, 8)" :key="n">
        <LazyVSkeletonLoader class="h-20" />
      </li>
    </ul>

    <template v-else>
      <div
        class="flex items-center gap-3 border-b border-line bg-ink px-4 py-2.5"
      >
        <LazyVCheckboxImput
          name="pickAllVouchers"
          label="Select all vouchers on this page"
          hide-label
          size="sm"
          :model-value="allSelected"
          :indeterminate="selected.length > 0 && !allSelected"
          :disabled="!rows.length"
          @update:model-value="toggleAll"
        />

        <span class="label-caps">Voucher identity / code</span>
        <span class="label-caps ms-auto hidden md:block"
          >Valuation · usage · status</span
        >
      </div>

      <ul class="divide-y divide-line">
        <li
          v-for="c in rows"
          :key="c.id"
          class="flex items-start gap-3 px-4 py-3 transition-colors duration-fast hover:bg-raised/60"
          :class="selectedId === c.id && 'bg-accent-soft'"
        >
          <LazyVCheckboxImput
            :name="`pick-${c.id}`"
            :label="`Select ${c.code}`"
            hide-label
            size="sm"
            class="mt-2"
            :model-value="selected.includes(c.id)"
            @update:model-value="toggle(c.id)"
          />

          <div
            class="grid min-w-0 flex-1 gap-x-4 gap-y-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
          >
            <!-- Identity -->
            <div class="min-w-0">
              <p class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-tight border border-line bg-ink px-2 py-1 font-mono text-xs font-semibold tracking-wide transition duration-fast hover:border-accent/60"
                  :class="c.state === 'expired' && 'text-mute line-through'"
                  :aria-current="selectedId === c.id ? 'true' : undefined"
                  @click="emit('select', c)"
                >
                  {{ c.code }}<span class="sr-only"> — edit</span>
                </button>

                <LazyVButton
                  variant="icon"
                  size="sm"
                  icon="lucide:copy"
                  :aria-label="`Copy code ${c.code}`"
                  @click="copy(c.code)"
                />

                <LazyVStatusBadge v-if="badge(c)" :tone="badge(c)!.tone">{{
                  badge(c)!.label
                }}</LazyVStatusBadge>
              </p>
              <p class="mt-1 text-sm leading-snug">{{ c.campaign }}</p>
              <p class="meta mt-0.5">{{ thresholds(c) }}</p>
            </div>

            <!-- Valuation, usage, status -->
            <div class="min-w-0 space-y-1.5">
              <p class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  class="rounded-tight bg-success-soft px-2 py-0.5 font-mono text-xs font-bold text-success"
                  >{{ valueLabel(c, money) }}</span
                >
                <LazyVStatusBadge
                  :tone="stateMeta[c.state].tone"
                  :icon="stateMeta[c.state].icon"
                  >{{ stateMeta[c.state].label }}</LazyVStatusBadge
                >
              </p>
              <div>
                <p class="flex justify-between font-mono text-xs tabular-nums">
                  <span>{{ number(c.used) }}</span>
                  <span class="text-mute">{{
                    c.limit === null
                      ? "unlimited"
                      : `/ ${number(c.limit)} (${pct(c)}%)`
                  }}</span>
                </p>
                <LazyVMeter
                  v-if="c.limit !== null"
                  class="mt-1"
                  :value="pct(c)"
                  :tone="
                    pct(c) >= 100
                      ? 'accent'
                      : pct(c) >= 90
                        ? 'warning'
                        : 'success'
                  "
                  :label="`Redemptions used for ${c.code}`"
                />
              </div>
              <p v-if="c.endsAt" class="meta">Ends {{ c.endsAt }}</p>
            </div>
          </div>

          <LazyVRowActions
            class="mt-1"
            :label="`Actions for ${c.code}`"
            duplicate
            @edit="emit('select', c)"
            @duplicate="emit('duplicate', c)"
            @remove="emit('remove', c)"
          >
            <button
              v-if="c.status === 'active' && c.state !== 'expired'"
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('pause', c)"
            >
              <Icon name="lucide:pause" size="16" aria-hidden="true" /> Pause
            </button>
            <button
              v-if="c.status === 'paused'"
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('resume', c)"
            >
              <Icon name="lucide:play" size="16" aria-hidden="true" /> Resume
            </button>
          </LazyVRowActions>
        </li>
      </ul>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { categoryMeta } from "~/data/product-meta";
import { stateMeta, typeMeta, valueLabel } from "~/data/coupon-meta";
import type { Tone } from "~/types/admin/dashboard";
import type { CouponRow } from "~/types/admin/coupons";

const props = defineProps<{
  rows: CouponRow[];
  loading?: boolean;
  perPage: number;
  selectedId: string | null;
}>();

const emit = defineEmits<{
  select: [coupon: CouponRow];
  duplicate: [coupon: CouponRow];
  remove: [coupon: CouponRow];
  pause: [coupon: CouponRow];
  resume: [coupon: CouponRow];
}>();

const selected = defineModel<string[]>("selected", { default: () => [] });

const { number, currency } = useFormatters();
const toast = useToast();

const money = (n: number) => currency(n, { maximumFractionDigits: 0 });
const pct = (c: CouponRow) =>
  c.limit ? Math.min(100, Math.round((c.used / c.limit) * 100)) : 0;

// A small tag next to the code: who or what the voucher is for.
const badge = (c: CouponRow): { label: string; tone: Tone } | null =>
  c.tier !== "all"
    ? { label: `${c.tier} only`, tone: "warning" }
    : c.type === "freight" || c.type === "labCredit"
      ? { label: typeMeta[c.type].short, tone: "info" }
      : c.categories.length === 1
        ? { label: categoryMeta[c.categories[0]!].label, tone: "neutral" }
        : null;

const thresholds = (c: CouponRow) =>
  [
    c.minOrder ? `Min ${money(c.minOrder)}` : "No minimum",
    c.categories.length
      ? c.categories.map((x) => categoryMeta[x].label).join(", ")
      : "All divisions",
    c.perAccount === 1 ? "single use per account" : null,
  ]
    .filter(Boolean)
    .join(" · ");

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((r) => selected.value.includes(r.id)),
);

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};
const toggleAll = () => {
  selected.value = allSelected.value ? [] : props.rows.map((r) => r.id);
};

const copy = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied", { description: code });
  } catch {
    toast.error("Couldn't copy", {
      description: "Select the code and copy it manually.",
    });
  }
};
</script>