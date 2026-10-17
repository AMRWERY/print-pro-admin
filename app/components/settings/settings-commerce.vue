<template>
  <settings-section
    id="payments"
    number="05"
    title="Payment gateways & escrow custody"
    description="How customers pay, and the point above which a payment is held in escrow until the goods are confirmed."
    :changed="changed.includes('payments')"
  >
    <!-- Bank wire -->
    <div class="rounded-card border border-line bg-ink/40 p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-sm font-semibold">
            <Icon name="lucide:landmark" size="16" class="text-accent" aria-hidden="true" />
            Escrow wire transfer
          </p>
          <p class="meta mt-0.5">
            Customers send funds to this account; release is manual after delivery.
          </p>
        </div>
        <LazyVSwitch v-model="s.payments.wireEnabled" label="Accept escrow wire transfers" />
      </div>

      <div v-if="s.payments.wireEnabled" class="mt-4 grid gap-4 md:grid-cols-2">
        <LazyVInput
          v-model="s.payments.bankName"
          name="bankName"
          label="Bank"
          optional
          maxlength="80"
        />
        <LazyVInput
          v-model="s.payments.escrowLimit"
          name="escrowLimit"
          type="number"
          label="Dual-sign escrow limit"
          required
          rules="required|min_value:0"
          min="0"
          hint="Releases above this need two approvers."
        />
        <LazyVInput
          v-model="s.payments.iban"
          name="iban"
          label="IBAN"
          required
          :rules="ibanRule(() => s.payments.wireEnabled)"
          maxlength="42"
          input-class="font-mono uppercase"
          dir="ltr"
        />
        <LazyVInput
          v-model="s.payments.bic"
          name="bic"
          label="BIC / SWIFT"
          required
          :rules="bicRule(() => s.payments.wireEnabled)"
          maxlength="11"
          input-class="font-mono uppercase"
          dir="ltr"
        />
      </div>
    </div>

    <!-- Cards -->
    <div class="rounded-card border border-line bg-ink/40 p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-sm font-semibold">
            <Icon name="lucide:credit-card" size="16" class="text-accent" aria-hidden="true" />
            Card & wallet payments
          </p>
          <p class="meta mt-0.5">Instant payment for smaller baskets.</p>
        </div>
        <LazyVSwitch v-model="s.payments.cardEnabled" label="Accept card payments" />
      </div>

      <fieldset v-if="s.payments.cardEnabled" class="mt-4">
        <legend class="label">Accepted methods</legend>
        <div class="mt-1.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <LazyVCheckboxImput
            v-for="m in cardMethodOptions"
            :key="m.value"
            v-model="s.payments.cardMethods"
            :name="`method-${m.value}`"
            :value="m.value"
            :label="m.label"
            :description="m.description"
            size="sm"
            boxed
          />
        </div>
        <p v-if="!s.payments.cardMethods.length" class="callout-accent mt-2" role="alert">
          <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
          Choose at least one method, or customers can't pay by card.
        </p>
      </fieldset>
    </div>

    <p v-if="!s.payments.wireEnabled && !s.payments.cardEnabled" class="callout-accent" role="alert">
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      Both payment options are off. Customers won't be able to check out.
    </p>

    <LazyVInput
      v-model="s.payments.escrowThreshold"
      name="escrowThreshold"
      type="number"
      label="Escrow threshold"
      required
      rules="required|min_value:0"
      min="0"
      class="md:max-w-sm"
      hint="Orders above this value are paid into escrow instead of straight to you."
    />
  </settings-section>

  <settings-section
    id="shipping"
    number="06"
    title="Shipping & armored logistics"
    description="Carriers offered at checkout, the default escort level and when delivery becomes free."
    :changed="changed.includes('shipping')"
  >
    <ul class="grid gap-3 lg:grid-cols-3">
      <li
        v-for="(c, i) in s.shipping.carriers"
        :key="c.id"
        class="flex flex-col gap-3 rounded-card border border-line bg-ink/40 p-4 transition-opacity duration-fast"
        :class="!c.enabled && 'opacity-75'"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm font-semibold">{{ c.name }}</p>
          <LazyVSwitch v-model="c.enabled" :label="`Offer ${c.name}`" />
        </div>
        <p class="meta">{{ c.description }}</p>
        <LazyVInput
          v-model="c.fee"
          :name="`carrierFee${i}`"
          type="number"
          label="Base fee per consignment"
          required
          rules="required|min_value:0"
          min="0"
          class="mt-auto"
        />
      </li>
    </ul>

    <fieldset>
      <legend class="label">Default escort priority</legend>
      <div class="mt-1.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <LazyVRadioInput
          v-for="t in escortOptions"
          :key="t.value"
          v-model="s.shipping.escortTier"
          name="escortTier"
          :value="t.value"
          :label="t.label"
          :description="t.description"
          boxed
          dense
        />
      </div>
    </fieldset>

    <LazyVInput
      v-model="s.shipping.freeThreshold"
      name="freeThreshold"
      type="number"
      label="Free delivery above basket value"
      required
      rules="required|min_value:0"
      min="0"
      class="md:max-w-sm"
    />
  </settings-section>

  <settings-section
    id="orders"
    number="07"
    title="Order processing & grace rules"
    description="Numbering, how long customers can cancel, and the limits for unverified customers."
    :changed="changed.includes('orders')"
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <LazyVInput
        v-model="s.orders.prefix"
        name="orderPrefix"
        label="Order number prefix"
        required
        :rules="orderPrefixRule"
        maxlength="16"
        input-class="font-mono uppercase"
        dir="ltr"
        :hint="`Next order: ${s.orders.prefix.toUpperCase()}0001`"
      />
      <LazyVInput
        v-model="s.orders.graceMinutes"
        name="graceMinutes"
        type="number"
        label="Cancellation grace (minutes)"
        required
        rules="required|integer|min_value:0|max_value:1440"
        min="0"
        max="1440"
      />
      <LazyVInput
        v-model="s.orders.clearanceHours"
        name="clearanceHours"
        type="number"
        label="Escrow clearance (hours)"
        required
        rules="required|integer|min_value:1|max_value:720"
        min="1"
        max="720"
      />
      <LazyVInput
        v-model="s.orders.maxUnverified"
        name="maxUnverified"
        type="number"
        label="Max unverified order value"
        required
        rules="required|min_value:0"
        min="0"
        hint="Above this, the customer must verify first."
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import { cardMethodOptions, escortOptions } from "~/data/settings-meta";
import type { Settings, SettingsKey } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });
defineProps<{ changed: SettingsKey[] }>();
</script>
