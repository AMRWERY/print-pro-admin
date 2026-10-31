<template>
  <LazyVDialog
    v-model:open="open"
    title="Create manual order"
    description="Opens an order awaiting payment for an existing customer."
  >
    <form
      id="create-order"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <LazyVSelectInput
        v-model="form.customerId"
        name="customerId"
        label="Customer"
        required
        rules="required"
        :options="customerOptions"
      />

      <LazyVSelectInput
        v-model="form.productId"
        name="productId"
        label="Product"
        required
        rules="required"
        :options="productOptions"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.quantity"
          name="quantity"
          type="number"
          label="Quantity"
          required
          rules="required|integer|min_value:1|max_value:50"
          min="1"
          max="50"
        />

        <LazyVSelectInput
          v-model="form.priority"
          name="priority"
          label="Priority"
          :options="priorityOptions"
        />
      </div>

      <p class="callout">
        <Icon
          name="lucide:landmark"
          size="14"
          class="bullet-icon"
          aria-hidden="true"
        />
        <span>
          Order value (incl. setup, courier and VAT)
          <strong class="font-mono text-paper tabular-nums">{{
            currency(total, { maximumFractionDigits: 0 })
          }}</strong>
          will be requested from the client before dispatch.
        </span>
      </p>

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
        form="create-order"
        :loading="loading"
        icon="lucide:circle-plus"
        >Create order</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { orderPricing } from "~/data/order-pricing";
import { priorityMeta } from "~/data/order-meta";
import type { AccountTier, OrderPriority, OrderRow } from "~/types/admin/orders";
import type { Customer, CustomerTier } from "~/types/admin/customers";
import type { Product } from "~/types/admin/products";

const emit = defineEmits<{ created: [row: OrderRow] }>();

const open = defineModel<boolean>("open", { default: false });

const { currency } = useFormatters();
const toast = useToast();

// Same rating-to-discount tier the server prices the order with.
const tierOf: Record<CustomerTier, AccountTier> = { AAA: "enterprise", AA: "business", A: "home" };

const customers = ref<Customer[]>([]);
const products = ref<Product[]>([]);

const customerOptions = computed(() => [
  { value: "", label: "Select a customer…" },
  ...customers.value.map((c) => ({ value: c.id, label: `${c.name} · ${c.org}` })),
]);

const productOptions = computed(() => [
  { value: "", label: "Select equipment or media…" },
  ...products.value.map((p) => ({ value: p.id, label: p.name })),
]);

const priorityOptions = (Object.keys(priorityMeta) as OrderPriority[]).map(
  (value) => ({
    value,
    label: priorityMeta[value].label,
  }),
);

const blank = () => ({
  customerId: "",
  productId: "",
  quantity: 1 as number | null,
  priority: "standard" as OrderPriority,
});
const form = reactive(blank());

// One form for the dialog's lifetime: reset whenever it opens.
const { validate, resetForm } = useForm();
watch(open, async (isOpen) => {
  if (!isOpen) return;
  Object.assign(form, blank());
  error.value = "";
  resetForm();
  // Loaded when the dialog opens so the lists are never stale.
  const [c, p] = await Promise.all([useCustomersStore().fetchPicker(), useProductsStore().fetchPicker()]);
  customers.value = c;
  products.value = p;
});

// Same pricing rule as the ledger: QA, courier, institutional discount and VAT included.
const total = computed(() => {
  const customer = customers.value.find((c) => c.id === form.customerId);
  const product = products.value.find((p) => p.id === form.productId);
  if (!customer || !product) return 0;
  return orderPricing(
    [{ unitPrice: product.price, quantity: Number(form.quantity) || 0 }],
    tierOf[customer.tier],
  ).total;
});

const loading = ref(false);
const error = ref("");

const submit = async () => {
  const result = await validate();
  if (!result.valid) {
    await nextTick();
    document
      .querySelector<HTMLElement>('dialog [aria-invalid="true"]')
      ?.focus();
    return;
  }

  loading.value = true;
  error.value = "";
  try {
    const row = await useOrdersStore().create({ ...form });
    toast.success(`Order ${row.id} created`, {
      description: "The order is waiting for payment.",
    });
    emit("created", row);
    open.value = false;
  } catch {
    error.value =
      "The order could not be created. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>