<template>
  <LazyVDialog
    v-model:open="open"
    title="Create manual requisition"
    description="Opens an escrow-clearing requisition for an existing atelier."
  >
    <form
      id="create-requisition"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <LazyVSelectInput
        v-model="form.customerId"
        name="customerId"
        label="Client atelier"
        required
        rules="required"
        :options="customerOptions"
      />

      <LazyVSelectInput
        v-model="form.apparatusId"
        name="apparatusId"
        label="Apparatus or media"
        required
        rules="required"
        :options="apparatusOptions"
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
          Escrow value (incl. QA, courier and VAT)
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
        form="create-requisition"
        :loading="loading"
        icon="lucide:circle-plus"
        >Create requisition</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { apparatus, customers } from "~/data/admin-orders";
import { orderPricing } from "~/data/order-pricing";
import { priorityMeta } from "~/data/order-meta";
import type { OrderPriority, OrderRow } from "~/types/admin/orders";

const emit = defineEmits<{ created: [row: OrderRow] }>();

const open = defineModel<boolean>("open", { default: false });

const { currency } = useFormatters();
const toast = useToast();

const customerOptions = [
  { value: "", label: "Select an atelier…" },
  ...customers.map((c, value) => ({ value, label: `${c.name} · ${c.org}` })),
];

const apparatusOptions = [
  { value: "", label: "Select equipment or media…" },
  ...apparatus.map((a, value) => ({ value, label: a.title })),
];

const priorityOptions = (Object.keys(priorityMeta) as OrderPriority[]).map(
  (value) => ({
    value,
    label: priorityMeta[value].label,
  }),
);

const blank = () => ({
  customerId: "" as number | "",
  apparatusId: "" as number | "",
  quantity: 1 as number | null,
  priority: "standard" as OrderPriority,
});
const form = reactive(blank());

// One form for the dialog's lifetime: reset whenever it opens.
const { validate, resetForm } = useForm();
watch(open, (isOpen) => {
  if (!isOpen) return;
  Object.assign(form, blank());
  error.value = "";
  resetForm();
});

// Same pricing rule as the ledger: QA, courier, institutional discount and VAT included.
const total = computed(() =>
  form.apparatusId === "" || form.customerId === ""
    ? 0
    : orderPricing(
        [
          {
            unitPrice: apparatus[form.apparatusId]!.price,
            quantity: Number(form.quantity) || 0,
          },
        ],
        customers[form.customerId]!.tier,
      ).total,
);

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
    const row = await $fetch<OrderRow>("/api/admin/orders", {
      method: "POST",
      body: { ...form },
    });
    toast.success(`Requisition ${row.id} created`, {
      description: "Escrow clearing has started.",
    });
    emit("created", row);
    open.value = false;
  } catch {
    error.value =
      "The requisition could not be created. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>