<template>
  <settings-section
    id="inventory"
    number="08"
    title="Inventory & warehouses"
    description="Defaults for new products, how fresh warehouse stock counts are, and automatic safeguards."
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
</template>

<script lang="ts" setup>
import type { Settings, SettingsKey } from "~/types/admin/settings";

const s = defineModel<Settings>({ required: true });

defineProps<{ changed: SettingsKey[] }>();
</script>
