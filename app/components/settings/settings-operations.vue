<template>
  <settings-section
    id="inventory"
    number="08"
    title="Stock alerts & reorder thresholds"
    description="Defaults for new products, how fresh stock counts are, and automatic safeguards."
    :changed="changed.includes('inventory')"
  >
    <div class="grid gap-4 md:grid-cols-3">
      <LazyVInput
        v-model="s.inventory.lowStockDefault"
        name="lowStockDefault"
        type="number"
        label="Low-stock threshold"
        required
        rules="required|integer|min_value:0"
        min="0"
        hint="Default for new products."
      />

      <LazyVInput
        v-model="s.inventory.reorderBufferDays"
        name="reorderBufferDays"
        type="number"
        label="Reorder buffer (days)"
        required
        rules="required|integer|min_value:0|max_value:365"
        min="0"
        max="365"
      />

      <LazyVInput
        v-model="s.inventory.warehouseSyncMinutes"
        name="warehouseSyncMinutes"
        type="number"
        label="Warehouse sync (minutes)"
        required
        rules="required|integer|min_value:1|max_value:1440"
        min="1"
        max="1440"
      />
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.inventory.autoHold"
        title="Auto-hold items that fail testing"
        description="Stock that fails a test print or function check is held out of sale until reviewed."
      />

      <settings-toggle
        v-model="s.inventory.barcodeVerify"
        title="Verify barcodes on receiving"
        description="Scanned items must match the purchase order before they are counted."
      />
    </div>
  </settings-section>

  <settings-section
    id="security"
    number="09"
    title="Security & sign-in"
    description="Sign-in requirements for every operator. Changes apply the next time someone signs in."
    :changed="changed.includes('security')"
  >
    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.security.requireFido2"
        title="Require hardware security keys"
        description="Operators must sign in with a FIDO2 key. SMS and authenticator codes are refused."
      />

      <settings-toggle
        v-model="s.security.physicalPresence"
        title="Physical presence for escalation"
        description="Raising privileges needs a key touch, even inside an open session."
      />
    </div>

    <p v-if="!s.security.requireFido2" class="callout-accent" role="alert">
      <Icon
        name="lucide:shield-alert"
        size="16"
        class="bullet-icon"
        aria-hidden="true"
      />
      Without hardware keys, operators can sign in with weaker methods. Keep
      this on unless you are rolling keys out.
    </p>

    <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <LazyVTextarea
        v-model="s.security.ipAllowlist"
        name="ipAllowlist"
        label="Allowed IP ranges"
        optional
        rows="4"
        maxlength="2000"
        :rules="cidrListRule"
        input-class="font-mono"
        hint="One address or range per line. Leave empty to allow any address."
      />

      <LazyVInput
        v-model="s.security.sessionTimeoutMinutes"
        name="sessionTimeout"
        type="number"
        label="Idle sign-out (minutes)"
        required
        rules="required|integer|min_value:5|max_value:480"
        min="5"
        max="480"
        hint="Operators are signed out after this long without activity."
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import type { Settings, SettingsKey } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{ changed: SettingsKey[] }>();
</script>