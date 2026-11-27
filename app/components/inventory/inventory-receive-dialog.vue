<template>
  <LazyVDialog
    v-model:open="open"
    :title="$t('inventory_ui.receive_title')"
    :description="$t('inventory_ui.receive_desc')"
  >
    <form
      id="receive-form"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <inventory-product-picker v-model="product" changeable />

      <template v-if="product">
        <div class="grid gap-4 sm:grid-cols-2">
          <LazyVInput
            v-model="qty"
            name="receiveQty"
            type="number"
            :label="$t('inventory_ui.receive_units')"
            required
            rules="required|integer|min_value:1"
            min="1"
          />

          <LazyVInput
            v-model="reference"
            name="receiveRef"
            :label="$t('inventory_ui.receive_reference')"
            required
            rules="required|min:3|max:200"
            maxlength="200"
            :placeholder="$t('inventory_ui.receive_reference_placeholder')"
          />
        </div>
        <p
          v-if="typeof qty === 'number' && qty > 0"
          class="callout"
          aria-live="polite"
        >
          <Icon
            name="lucide:package-plus"
            size="14"
            class="bullet-icon"
            aria-hidden="true"
          />
          <span>
            <i18n-t keypath="inventory_ui.receive_stock_change">
              <template #from>{{ product.stock }}</template>
              <template #to
                ><strong>{{ product.stock + qty }}</strong></template
              >
            </i18n-t>
          </span>
        </p>
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
        form="receive-form"
        :loading="loading"
        :disabled="!product"
        icon="lucide:package-plus"
        >{{ $t('inventory_ui.receive_submit') }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import type { InventoryItem } from "~/types/admin/inventory";

const emit = defineEmits<{ done: [item: InventoryItem] }>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const { t } = useI18n();

const product = ref<InventoryItem | null>(null);
const qty = ref<number | null>(null);
const reference = ref("");
const error = ref("");
const loading = ref(false);

const { validate, resetForm } = useForm();

watch(open, (isOpen) => {
  if (!isOpen) return;
  product.value = null;
  qty.value = null;
  reference.value = "";
  error.value = "";
  resetForm();
});

const submit = async () => {
  if (!product.value) return;
  const { valid } = await validate();
  if (!valid) return;

  loading.value = true;
  error.value = "";
  try {
    const updated = await useInventoryStore().receive({
      productId: product.value.id,
      qty: qty.value,
      reference: reference.value,
    });
    toast.success(t('inventory_ui.toast_received'), {
      description: t('inventory_ui.toast_received_desc', { name: updated.name, stock: updated.stock }),
    });
    emit("done", updated);
    open.value = false;
  } catch {
    error.value = t('inventory_ui.error_receive');
  } finally {
    loading.value = false;
  }
};
</script>