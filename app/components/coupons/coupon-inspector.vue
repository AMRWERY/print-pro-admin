<template>
  <LazyVPanel
    :title="coupon ? 'Edit voucher' : 'Create voucher'"
    :subtitle="
      coupon
        ? `Live inspection · ${coupon.code}`
        : 'Set up a voucher for your customers'
    "
    :icon="coupon ? 'lucide:ticket-percent' : 'lucide:circle-plus'"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        aria-label="Close"
        @click="emit('close')"
      />
    </template>

    <form
      id="coupon-form"
      class="space-y-5"
      novalidate
      @submit.prevent="submit"
    >
      <!-- 01 -->
      <section class="space-y-3" aria-labelledby="cp-identity">
        <h3 id="cp-identity" class="label-caps">
          01 // Voucher identity &amp; code
        </h3>
        <div class="flex items-end gap-2">
          <LazyVInput
            v-model="form.code"
            name="cpCode"
            label="Coupon code"
            required
            rules="required|min:3|max:40"
            class="min-w-0 flex-1"
            input-class="font-mono uppercase"
            maxlength="40"
          />

          <LazyVButton
            variant="secondary"
            icon="lucide:shuffle"
            @click="generate"
            >Generate</LazyVButton
          >
        </div>
        <LazyVInput
          v-model="form.campaign"
          name="cpCampaign"
          label="Campaign / internal name"
          required
          rules="required|min:2|max:120"
          maxlength="120"
        />

        <LazyVTextarea
          v-model="form.description"
          name="cpDescription"
          label="Public storefront description"
          optional
          rows="3"
          maxlength="300"
        />
      </section>

      <!-- 02 -->
      <section class="space-y-3" aria-labelledby="cp-mechanism">
        <h3 id="cp-mechanism" class="label-caps">
          02 // Discount mechanism &amp; valuation
        </h3>
        <fieldset>
          <legend class="label">Concession type</legend>
          <div class="mt-1.5 grid gap-2 sm:grid-cols-2">
            <LazyVRadioInput
              v-for="t in typeChoices"
              :key="t.value"
              v-model="form.type"
              name="cpType"
              :value="t.value"
              :label="t.label"
              boxed
              dense
            />
          </div>
        </fieldset>
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVInput
            :key="form.type"
            v-model="form.value"
            name="cpValue"
            type="number"
            :label="
              form.type === 'percentage'
                ? 'Discount value (%)'
                : 'Concession value'
            "
            required
            :rules="
              form.type === 'percentage'
                ? 'required|min_value:1|max_value:100'
                : 'required|min_value:1'
            "
            min="0"
            step="0.01"
          />

          <LazyVInput
            v-if="form.type === 'percentage'"
            v-model="form.cap"
            name="cpCap"
            type="number"
            label="Cap per order (margin safety)"
            optional
            rules="min_value:0"
            min="0"
          />
        </div>
        <p class="callout" aria-live="polite">
          <Icon
            name="lucide:calculator"
            size="14"
            class="bullet-icon"
            aria-hidden="true"
          />
          <span>{{ preview }}</span>
        </p>
      </section>

      <!-- 03 -->
      <section class="space-y-3" aria-labelledby="cp-usage">
        <h3 id="cp-usage" class="label-caps">
          03 // Usage rules &amp; cap
        </h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <LazyVInput
              :key="String(form.unlimited)"
              v-model="form.limit"
              name="cpLimit"
              type="number"
              label="Total redemptions"
              :required="!form.unlimited"
              :rules="form.unlimited ? '' : 'required|integer|min_value:1'"
              min="1"
              :disabled="form.unlimited"
            />

            <LazyVCheckboxImput
              v-model="form.unlimited"
              name="cpUnlimited"
              label="Unlimited"
              size="sm"
              class="mt-1.5"
            />
          </div>

          <LazyVSelectInput
            v-model="form.perAccount"
            name="cpPerAccount"
            label="Per-account limit"
            :options="perAccountOptions"
          />
        </div>

        <LazyVInput
          v-model="form.minOrder"
          name="cpMin"
          type="number"
          label="Minimum order value"
          optional
          rules="min_value:0"
          min="0"
        />
      </section>

      <!-- 04 -->
      <section class="space-y-3" aria-labelledby="cp-eligibility">
        <h3 id="cp-eligibility" class="label-caps">
          04 // Eligibility &amp; hardware bounds
        </h3>
        <LazyVSelectInput
          v-model="form.tier"
          name="cpTier"
          label="Customer tier"
          :options="tierChoices"
        />

        <fieldset>
          <legend class="label">
            Allowed categories
            <span class="font-normal text-mute">(none selected means all)</span>
          </legend>
          <div class="mt-1.5 grid gap-2 sm:grid-cols-2">
            <LazyVCheckboxImput
              v-for="c in categoryChoices"
              :key="c.value"
              v-model="form.categories"
              :name="`cpCat-${c.value}`"
              :value="c.value"
              :label="c.label"
              size="sm"
            />
          </div>
        </fieldset>
      </section>

      <!-- 05 -->
      <section class="space-y-3" aria-labelledby="cp-schedule">
        <h3 id="cp-schedule" class="label-caps">05 // Schedule &amp; status</h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVDatePicker
            v-model="form.startsAt"
            name="cpStart"
            label="Starts"
            optional
            clearable
            :shortcuts="false"
            placeholder="No start date"
          />

          <LazyVDatePicker
            v-model="form.endsAt"
            name="cpEnd"
            label="Ends"
            optional
            clearable
            :shortcuts="false"
            placeholder="No end date"
            :min="form.startsAt || undefined"
          />
        </div>

        <LazyVSelectInput
          v-model="form.status"
          name="cpStatus"
          label="Status"
          :options="statusOptions"
        />
      </section>

      <p v-if="shownError" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ shownError }}
      </p>
    </form>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4"
    >
      <LazyVButton
        v-if="coupon"
        variant="tertiary"
        icon="lucide:trash-2"
        class="!text-accent"
        :disabled="saving"
        @click="emit('remove')"
        >Delete voucher</LazyVButton
      >

      <span v-else />

      <LazyVButton
        type="submit"
        form="coupon-form"
        :loading="saving"
        icon="lucide:save"
        >{{ coupon ? "Save changes" : "Create voucher" }}</LazyVButton
      >
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import { categoryMeta } from "~/data/product-meta";
import {
  perAccountOptions,
  statusOptions,
  tierOptions,
  typeMeta,
} from "~/data/coupon-meta";
import type { Coupon, CouponInput, CouponType } from "~/types/admin/coupons";
import type { ProductCategory } from "~/types/admin/products";

const props = defineProps<{
  /** The voucher being edited; null when creating. */
  coupon: Coupon | null;
  /** For a duplicate: the settings to start from, in a new voucher. */
  seed?: Coupon | null;
  saving?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  save: [values: CouponInput];
  remove: [];
  close: [];
}>();

const { currency } = useFormatters();

const typeChoices = (Object.keys(typeMeta) as CouponType[]).map((value) => ({
  value,
  label: typeMeta[value].label,
}));

const categoryChoices = (Object.keys(categoryMeta) as ProductCategory[]).map(
  (value) => ({ value, label: categoryMeta[value].label }),
);

const tierChoices = tierOptions.map((o) => ({
  ...o,
  label: o.value === "all" ? "All customers" : o.label,
}));

const c = props.coupon ?? props.seed ?? null;

const form = reactive({
  code: c?.code ?? "",
  campaign: c?.campaign ?? "",
  description: c?.description ?? "",
  type: (c?.type ?? "percentage") as CouponType,
  value: (c?.value ?? null) as number | null,
  cap: (c?.cap ?? null) as number | null,
  limit: (c?.limit ?? 100) as number | null,
  unlimited: c ? c.limit === null : false,
  perAccount: c?.perAccount ?? 1,
  minOrder: (c?.minOrder ?? null) as number | null,
  tier: c?.tier ?? ("all" as Coupon["tier"]),
  categories: [...(c?.categories ?? [])] as ProductCategory[],
  startsAt: c?.startsAt ?? "",
  endsAt: c?.endsAt ?? "",
  status: c?.status ?? ("draft" as Coupon["status"]),
});

const generate = () => {
  const word = (form.campaign.match(/[A-Za-z]{3,}/)?.[0] ?? "VOUCHER")
    .toUpperCase()
    .slice(0, 8);
  form.code = `${word}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

// What one redemption is worth, on the smallest basket the voucher allows.
const preview = computed(() => {
  const v = Number(form.value);
  if (!v) return "Enter a value to see a sample concession.";
  const basket = Math.max(Number(form.minOrder) || 0, 5000);
  const money = (n: number) => currency(n, { maximumFractionDigits: 2 });
  if (form.type !== "percentage")
    return `Each redemption takes ${money(v)} off the order.`;
  const raw = (basket * v) / 100;
  const capped = form.cap ? Math.min(raw, Number(form.cap)) : raw;
  return `On a ${money(basket)} basket the concession is ${money(capped)}${capped < raw ? " (capped)" : ""}.`;
});

const { validate } = useForm();
const localError = ref("");

const submit = async () => {
  localError.value = "";
  const { valid } = await validate();
  if (!valid) return;
  if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
    localError.value = "The end date must be on or after the start date.";
    return;
  }
  emit("save", {
    code: form.code,
    campaign: form.campaign,
    description: form.description,
    type: form.type,
    value: Number(form.value),
    cap: form.type === "percentage" && form.cap ? Number(form.cap) : null,
    limit: form.unlimited ? null : Number(form.limit),
    perAccount: form.perAccount || null,
    minOrder: Number(form.minOrder) || 0,
    tier: form.tier,
    categories: form.categories,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    status: form.status,
  });
};

// A date error from here shows in the same place as a server error.
const shownError = computed(() => localError.value || props.error);
</script>