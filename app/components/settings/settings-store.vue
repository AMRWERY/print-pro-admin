<template>
  <settings-section
    id="store"
    number="01"
    title="Store information"
    description="The legal identity shown on invoices, proofs and the storefront footer."
    :changed="changed.includes('store')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <LazyVInput
        v-model="s.store.legalName"
        name="legalName"
        label="Studio & foundry legal name"
        required
        rules="required|min:2|max:120"
        maxlength="120"
        autocomplete="organization"
      />

      <LazyVInput
        v-model="s.store.registration"
        name="registration"
        label="Commercial registration (UID)"
        optional
        maxlength="60"
        input-class="font-mono"
      />
    </div>

    <LazyVInput
      v-model="s.store.address"
      name="address"
      label="Primary cleanroom coordinates"
      required
      rules="required|min:3|max:200"
      maxlength="200"
      autocomplete="street-address"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <LazyVSelectInput
        v-model="s.store.timezone"
        name="timezone"
        label="Time zone"
        :options="timezoneChoices"
        hint="Used for scheduled content, cut-off times and report dates."
      />
    </div>

    <!-- Storefront state: the one switch here that changes what customers see -->
    <div
      class="rounded-card border p-4 transition-colors duration-fast"
      :class="
        live ? 'border-line bg-ink/40' : 'border-yellow/60 bg-yellow-soft'
      "
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="flex items-center gap-2 text-sm font-semibold">
            <Icon
              :name="live ? 'lucide:store' : 'lucide:construction'"
              size="16"
              aria-hidden="true"
            />
            Storefront is {{ live ? "live" : "in maintenance" }}
          </p>
          <p class="meta mt-0.5">
            {{
              live
                ? "Customers can browse and order."
                : "Customers see the maintenance message. The admin keeps working."
            }}
          </p>
        </div>
        <LazyVSwitch
          :model-value="live"
          label="Storefront live"
          @update:model-value="
            (v: boolean) => (s.store.storefront = v ? 'live' : 'maintenance')
          "
        />
      </div>
      <LazyVInput
        v-if="!live"
        v-model="s.store.maintenanceMessage"
        name="maintenanceMessage"
        label="Maintenance message"
        class="mt-3"
        maxlength="200"
        rules="required|max:200"
        required
      />
    </div>
  </settings-section>

  <settings-section
    id="contact"
    number="02"
    title="Contact & escrow desk"
    description="Where customers and carriers reach you, and the key used to encrypt escrow messages."
    :changed="changed.includes('contact')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <LazyVInput
        v-model="s.contact.email"
        name="contactEmail"
        type="email"
        label="Collector concierge email"
        required
        rules="required|email"
        maxlength="120"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.phone"
        name="contactPhone"
        type="tel"
        label="Desk phone"
        required
        :rules="phoneRequiredRule"
        maxlength="24"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.emergencyPhone"
        name="emergencyPhone"
        type="tel"
        label="Armored-transit emergency line"
        optional
        :rules="phoneOptionalRule"
        maxlength="24"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.pgpKey"
        name="pgpKey"
        label="PGP key ID for escrow release"
        optional
        maxlength="80"
        input-class="font-mono"
        dir="ltr"
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import { timezoneOptions } from "~/data/settings-meta";
import type { Settings, SettingsKey } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{ changed: SettingsKey[] }>();

const live = computed(() => s.value.store.storefront === "live");

// A saved zone that isn't in the short list still shows up as an option.
const timezoneChoices = computed(() =>
  timezoneOptions.some((o) => o.value === s.value.store.timezone)
    ? timezoneOptions
    : [
        ...timezoneOptions,
        { value: s.value.store.timezone, label: s.value.store.timezone },
      ],
);
</script>