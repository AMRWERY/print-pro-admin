<template>
  <LazyVDialog
    v-model:open="open"
    title="Receive delivery"
    description="Book delivered units into stock. The history records the delivery reference."
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
            label="Units received"
            required
            rules="required|integer|min_value:1"
            min="1"
          />

          <LazyVInput
            v-model="reference"
            name="receiveRef"
            label="Delivery reference"
            required
            rules="required|min:3|max:200"
            maxlength="200"
            placeholder="Delivery note or PO number"
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
          <span
            >Stock goes from {{ product.stock }} to
            <strong>{{ product.stock + qty }}</strong
            >.</span
          >
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
        >Cancel</LazyVButton
      >

      <LazyVButton
        type="submit"
        form="receive-form"
        :loading="loading"
        :disabled="!product"
        icon="lucide:package-plus"
        >Receive into stock</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import type { InventoryItem } from "~/types/admin/inventory";

const emit = defineEmits<{ done: [item: InventoryItem] }>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

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
    const updated = await $fetch<InventoryItem>(
      "/api/admin/inventory/receive",
      {
        method: "POST",
        body: {
          productId: product.value.id,
          qty: qty.value,
          reference: reference.value,
        },
      },
    );
    toast.success("Delivery received", {
      description: `${updated.name}: now ${updated.stock} in stock.`,
    });
    emit("done", updated);
    open.value = false;
  } catch {
    error.value =
      "The delivery could not be booked. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>