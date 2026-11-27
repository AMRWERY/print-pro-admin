<template>
  <settings-section
    id="payments"
    number="05"
    :title="$t('settings_ui.payments_title')"
    :description="$t('settings_ui.payments_desc')"
    :changed="changed.includes('payments')"
  >
    <!-- Bank wire -->
    <div class="rounded-card border border-line bg-ink/40 p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-sm font-semibold">
            <Icon name="lucide:landmark" size="16" class="text-accent" aria-hidden="true" />
            {{ $t('settings_ui.bank_transfer') }}
          </p>
          <p class="meta mt-0.5">
            {{ $t('settings_ui.bank_transfer_desc') }}
          </p>
        </div>
        <LazyVSwitch v-model="s.payments.wireEnabled" :label="$t('settings_ui.bank_transfers')" />
      </div>

      <div v-if="s.payments.wireEnabled" class="mt-4 grid gap-4 md:grid-cols-2">
        <LazyVInput
          v-model="s.payments.bankName"
          name="bankName"
          :label="$t('settings_ui.bank')"
          optional
          maxlength="80"
        />
        <LazyVInput
          v-model="s.payments.approvalLimit"
          name="approvalLimit"
          type="number"
          :label="$t('settings_ui.two_approver_limit')"
          required
          rules="required|min_value:0"
          min="0"
          :hint="$t('settings_ui.two_approver_hint')"
        />
        <LazyVInput
          v-model="s.payments.iban"
          name="iban"
          :label="$t('settings_ui.iban')"
          required
          :rules="ibanRule(() => s.payments.wireEnabled)"
          maxlength="42"
          input-class="font-mono uppercase"
          dir="ltr"
        />
        <LazyVInput
          v-model="s.payments.bic"
          name="bic"
          :label="$t('settings_ui.bic_swift')"
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
            {{ $t('settings_ui.card_wallet') }}
          </p>
          <p class="meta mt-0.5">{{ $t('settings_ui.card_wallet_desc') }}</p>
        </div>
        <LazyVSwitch v-model="s.payments.cardEnabled" :label="$t('settings_ui.accept_cards')" />
      </div>

      <fieldset v-if="s.payments.cardEnabled" class="mt-4">
        <legend class="label">{{ $t('settings_ui.accepted_methods') }}</legend>
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
          {{ $t('settings_ui.card_method_required') }}
        </p>
      </fieldset>
    </div>

    <p v-if="!s.payments.wireEnabled && !s.payments.cardEnabled" class="callout-accent" role="alert">
      <Icon name="lucide:circle-alert" size="16" class="bullet-icon" aria-hidden="true" />
      {{ $t('settings_ui.payments_both_off') }}
    </p>

    <LazyVInput
      v-model="s.payments.holdThreshold"
      name="holdThreshold"
      type="number"
      :label="$t('settings_ui.hold_threshold')"
      required
      rules="required|min_value:0"
      min="0"
      class="md:max-w-sm"
      :hint="$t('settings_ui.hold_threshold_hint')"
    />
  </settings-section>

  <settings-section
    id="shipping"
    number="06"
    :title="$t('settings_ui.shipping_title')"
    :description="$t('settings_ui.shipping_desc')"
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
          <LazyVSwitch v-model="c.enabled" :label="$t('settings_ui.offer_carrier', { name: c.name })" />
        </div>
        <p class="meta">{{ c.description }}</p>
        <LazyVInput
          v-model="c.fee"
          :name="`carrierFee${i}`"
          type="number"
          :label="$t('settings_ui.base_fee')"
          required
          rules="required|min_value:0"
          min="0"
          class="mt-auto"
        />
      </li>
    </ul>

    <fieldset>
      <legend class="label">{{ $t('settings_ui.default_service') }}</legend>
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
      :label="$t('settings_ui.free_above')"
      required
      rules="required|min_value:0"
      min="0"
      class="md:max-w-sm"
    />
  </settings-section>

  <settings-section
    id="orders"
    number="07"
    :title="$t('settings_ui.orders_title')"
    :description="$t('settings_ui.orders_desc')"
    :changed="changed.includes('orders')"
  >
    <!-- Each field spans three shared rows (label, input, hint), so inputs line up even when a label wraps. -->
    <div class="-mb-4 grid gap-x-4 md:grid-cols-2 xl:grid-cols-4">
      <LazyVInput
        class="row-span-3 mb-4 grid grid-rows-subgrid"
        v-model="s.orders.prefix"
        name="orderPrefix"
        :label="$t('settings_ui.order_prefix')"
        required
        :rules="orderPrefixRule"
        maxlength="16"
        input-class="font-mono uppercase"
        dir="ltr"
        :hint="$t('settings_ui.next_order', { number: `${s.orders.prefix.toUpperCase()}0001` })"
      />
      <LazyVInput
        class="row-span-3 mb-4 grid grid-rows-subgrid"
        v-model="s.orders.graceMinutes"
        name="graceMinutes"
        type="number"
        :label="$t('settings_ui.cancel_grace')"
        required
        rules="required|integer|min_value:0|max_value:1440"
        min="0"
        max="1440"
      />
      <LazyVInput
        class="row-span-3 mb-4 grid grid-rows-subgrid"
        v-model="s.orders.paymentWindowHours"
        name="paymentWindowHours"
        type="number"
        :label="$t('settings_ui.payment_window')"
        required
        rules="required|integer|min_value:1|max_value:720"
        min="1"
        max="720"
      />
      <LazyVInput
        class="row-span-3 mb-4 grid grid-rows-subgrid"
        v-model="s.orders.maxUnverified"
        name="maxUnverified"
        type="number"
        :label="$t('settings_ui.max_unverified')"
        required
        rules="required|min_value:0"
        min="0"
        :hint="$t('settings_ui.max_unverified_hint')"
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
