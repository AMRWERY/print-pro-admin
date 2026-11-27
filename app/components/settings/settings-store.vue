<template>
  <settings-section
    id="store"
    number="01"
    :title="$t('settings_ui.sec_store')"
    :description="$t('settings_ui.store_desc')"
    :changed="changed.includes('store')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <LazyVInput
        v-model="s.store.legalName"
        name="legalName"
        :label="$t('settings_ui.legal_name')"
        required
        rules="required|min:2|max:120"
        maxlength="120"
        autocomplete="organization"
      />

      <LazyVInput
        v-model="s.store.registration"
        name="registration"
        :label="$t('settings_ui.registration')"
        optional
        maxlength="60"
        input-class="font-mono"
      />
    </div>

    <LazyVInput
      v-model="s.store.address"
      name="address"
      :label="$t('settings_ui.head_office')"
      required
      rules="required|min:3|max:200"
      maxlength="200"
      autocomplete="street-address"
    />

    <div class="grid gap-4 md:grid-cols-2">
      <LazyVSelectInput
        v-model="s.store.timezone"
        name="timezone"
        :label="$t('settings_ui.time_zone')"
        :options="timezoneChoices"
        :hint="$t('settings_ui.time_zone_hint')"
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
            {{ live ? $t('settings_ui.storefront_live_title') : $t('settings_ui.storefront_maint_title') }}
          </p>
          <p class="meta mt-0.5">
            {{
              live
                ? $t('settings_ui.storefront_live_desc')
                : $t('settings_ui.storefront_maint_desc')
            }}
          </p>
        </div>
        <LazyVSwitch
          :model-value="live"
          :label="$t('settings_ui.storefront_live_label')"
          @update:model-value="
            (v: boolean) => (s.store.storefront = v ? 'live' : 'maintenance')
          "
        />
      </div>
      <LazyVInput
        v-if="!live"
        v-model="s.store.maintenanceMessage"
        name="maintenanceMessage"
        :label="$t('settings_ui.maintenance_message')"
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
    :title="$t('settings_ui.sec_contact')"
    :description="$t('settings_ui.contact_desc')"
    :changed="changed.includes('contact')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <LazyVInput
        v-model="s.contact.email"
        name="contactEmail"
        type="email"
        :label="$t('settings_ui.concierge_email')"
        required
        rules="required|email"
        maxlength="120"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.phone"
        name="contactPhone"
        type="tel"
        :label="$t('settings_ui.desk_phone')"
        required
        :rules="phoneRequiredRule"
        maxlength="24"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.emergencyPhone"
        name="emergencyPhone"
        type="tel"
        :label="$t('settings_ui.emergency_line')"
        optional
        :rules="phoneOptionalRule"
        maxlength="24"
        dir="ltr"
      />

      <LazyVInput
        v-model="s.contact.pgpKey"
        name="pgpKey"
        :label="$t('settings_ui.pgp_key')"
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