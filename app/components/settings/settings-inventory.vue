<template>
  <settings-section
    id="inventory"
    number="08"
    :title="$t('settings_ui.sec_inventory')"
    :description="$t('settings_ui.inventory_desc')"
    :changed="changed.includes('inventory')"
  >
    <div class="grid gap-4 md:grid-cols-3">
      <LazyVInput
        v-model="s.inventory.lowStockDefault"
        name="lowStockDefault"
        type="number"
        :label="$t('settings_ui.low_stock')"
        required
        rules="required|integer|min_value:0"
        min="0"
        :hint="$t('settings_ui.low_stock_hint')"
      />

      <LazyVInput
        v-model="s.inventory.reorderBufferDays"
        name="reorderBufferDays"
        type="number"
        :label="$t('settings_ui.reorder_buffer')"
        required
        rules="required|integer|min_value:0|max_value:365"
        min="0"
        max="365"
      />

      <LazyVInput
        v-model="s.inventory.warehouseSyncMinutes"
        name="warehouseSyncMinutes"
        type="number"
        :label="$t('settings_ui.warehouse_sync')"
        required
        rules="required|integer|min_value:1|max_value:1440"
        min="1"
        max="1440"
      />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <settings-toggle
        v-model="s.inventory.autoHold"
        :title="$t('settings_ui.auto_hold_title')"
        :description="$t('settings_ui.auto_hold_desc')"
      />

      <settings-toggle
        v-model="s.inventory.barcodeVerify"
        :title="$t('settings_ui.barcode_title')"
        :description="$t('settings_ui.barcode_desc')"
      />
    </div>
  </settings-section>
</template>

<script lang="ts" setup>
import type { Settings, SettingsKey } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{ changed: SettingsKey[] }>();
</script>
