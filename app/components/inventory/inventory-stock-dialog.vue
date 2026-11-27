<template>
  <LazyVDialog
    v-model:open="open"
    :title="$t('inventory_ui.adjust_modal_title')"
    :description="$t('inventory_ui.adjust_desc')"
    size="lg"
  >
    <form id="stock-form" class="space-y-4" novalidate @submit.prevent="submit">
      <inventory-product-picker v-model="product" :changeable="!fixed" />

      <template v-if="product">
        <LazyVSegmented v-model="tab" :label="$t('common_ui.action')" :options="tabOptions" />

        <template v-if="tab === 'adjust'">
          <LazyVSegmented
            v-model="mode"
            :label="$t('inventory_ui.adjust_type')"
            :options="modeOptions"
          />

          <div class="grid gap-4 sm:grid-cols-2">
            <LazyVInput
              :key="mode"
              v-model="qty"
              name="qty"
              type="number"
              :label="
                mode === 'delta'
                  ? $t('inventory_ui.adjust_delta_label')
                  : $t('inventory_ui.adjust_counted_label')
              "
              required
              :rules="
                mode === 'set'
                  ? 'required|integer|min_value:0'
                  : 'required|integer'
              "
              step="1"
            />
            <div
              class="rounded-card border border-line bg-ink p-3"
              aria-live="polite"
            >
              <p class="label-caps">{{ $t('inventory_ui.stock_after') }}</p>
              <p
                v-if="next !== null"
                class="font-display text-2xl font-bold tabular-nums"
                :class="next < 0 ? 'text-accent' : ''"
              >
                {{ product.stock }} <span class="text-mute">→</span> {{ next }}
              </p>
              <p v-else class="text-sm text-mute">{{ $t('inventory_ui.enter_quantity') }}</p>

              <p
                v-if="next !== null && next < 0"
                class="mt-1 text-xs text-accent"
              >
                {{ $t('inventory_ui.stock_below_zero') }}
              </p>
            </div>
          </div>

          <LazyVInput
            v-model="reason"
            name="reason"
            :label="$t('inventory_ui.reason')"
            required
            rules="required|min:3|max:200"
            maxlength="200"
            :placeholder="$t('inventory_ui.reason_placeholder')"
          />
        </template>

        <template v-else>
          <LazyVSelectInput
            v-model="warehouse"
            name="warehouse"
            :label="$t('inventory_ui.move_to_warehouse')"
            required
            rules="required"
            :options="warehouseChoices"
          />
          <p class="callout">
            <Icon
              name="lucide:info"
              size="14"
              class="bullet-icon"
              aria-hidden="true"
            />
            <span>
              <i18n-t keypath="inventory_ui.currently_kept_in">
                <template #warehouse
                  ><strong>{{ warehouseLabel[product.warehouse] }}</strong></template
                >
                <template #bin>{{ product.bin }}</template>
              </i18n-t>
            </span>
          </p>
        </template>
      </template>

      <p v-if="error" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ error }}
      </p>
    </form>

    <template #footer>
      <LazyVButton variant="secondary" :disabled="loading" @click="open = false"
        >{{ $t('btn.cancel') }}</LazyVButton
      >

      <LazyVButton
        type="submit"
        form="stock-form"
        :loading="loading"
        :disabled="!product || (tab === 'adjust' && next !== null && next < 0)"
        icon="lucide:check"
        >{{ tab === "adjust" ? $t('inventory_ui.record_adjustment') : $t('inventory_ui.move_item') }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { warehouseLabel } from "~/data/inventory-meta";
import type { InventoryItem, Warehouse } from "~/types/admin/inventory";

const props = defineProps<{ item: InventoryItem | null }>();

const emit = defineEmits<{ done: [item: InventoryItem] }>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const { t } = useI18n();

const tabOptions = computed(() => [
  { value: "adjust" as const, label: t('inventory_ui.adjust_stock') },
  { value: "transfer" as const, label: t('inventory_ui.tab_move_warehouse') },
]);
const modeOptions = computed(() => [
  { value: "delta" as const, label: t('inventory_ui.mode_delta') },
  { value: "set" as const, label: t('inventory_ui.mode_set') },
]);

const product = ref<InventoryItem | null>(null);
const fixed = ref(false);
const tab = ref<"adjust" | "transfer">("adjust");
const mode = ref<"delta" | "set">("delta");
const qty = ref<number | null>(null);
const reason = ref("");
const warehouse = ref<Warehouse | "">("");
const error = ref("");
const loading = ref(false);

const { validate, resetForm } = useForm();

// Start fresh each time the dialog opens; a row's Adjust button pre-selects its product.
watch(open, (isOpen) => {
  if (!isOpen) return;
  product.value = props.item;
  fixed.value = !!props.item;
  tab.value = "adjust";
  mode.value = "delta";
  qty.value = null;
  reason.value = "";
  warehouse.value = "";
  error.value = "";
  resetForm();
});

const warehouseChoices = computed(() => [
  { value: "", label: t('inventory_ui.select_warehouse') },
  ...(Object.keys(warehouseLabel) as Warehouse[])
    .filter((v) => v !== product.value?.warehouse)
    .map((v) => ({ value: v, label: warehouseLabel[v] })),
]);

const next = computed(() => {
  if (!product.value || typeof qty.value !== "number") return null;
  return mode.value === "set" ? qty.value : product.value.stock + qty.value;
});

const submit = async () => {
  if (!product.value) return;
  const { valid } = await validate();
  if (!valid) return;

  loading.value = true;
  error.value = "";
  try {
    const inventory = useInventoryStore();
    const updated =
      tab.value === "adjust"
        ? await inventory.adjust({
            productId: product.value.id,
            mode: mode.value,
            qty: qty.value,
            reason: reason.value,
          })
        : await inventory.transfer({ productId: product.value.id, warehouse: warehouse.value });
    toast.success(tab.value === "adjust" ? t('inventory_ui.toast_stock_adjusted') : t('inventory_ui.toast_item_moved'), {
      description: updated.name,
    });
    emit("done", updated);
    open.value = false;
  } catch (e) {
    const status = statusOf(e);
    error.value =
      status === 409
        ? t('inventory_ui.error_stock_limit')
        : status === 400
          ? t('inventory_ui.error_nothing_to_change')
          : t('inventory_ui.error_change_save');
  } finally {
    loading.value = false;
  }
};
</script>