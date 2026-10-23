<template>
  <LazyVDialog
    v-model:open="open"
    :title="customer ? 'Edit customer' : 'Register customer'"
    :description="
      customer
        ? 'Changes apply to the registry straight away.'
        : 'Adds a customer record to the directory.'
    "
    size="lg"
  >
    <form
      id="customer-form"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="clientName"
          label="Full name"
          required
          rules="required|min:2|max:80"
          maxlength="80"
        />

        <LazyVInput
          v-model="form.role"
          name="clientRole"
          label="Role / title"
          optional
          maxlength="100"
        />

        <LazyVInput
          v-model="form.org"
          name="clientOrg"
          label="Organization"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          class="sm:col-span-2"
        />

        <LazyVInput
          v-model="form.email"
          name="clientEmail"
          type="email"
          label="Primary email"
          required
          rules="required|email"
        />

        <LazyVInput
          v-model="form.phone"
          name="clientPhone"
          type="tel"
          label="Direct line"
          optional
          maxlength="30"
        />

        <LazyVInput
          v-model="form.node"
          name="clientRegion"
          label="Region or branch"
          optional
          maxlength="60"
          placeholder="Cairo"
        />

        <LazyVInput
          v-model="form.taxId"
          name="clientTax"
          label="Tax / legal ID"
          optional
          maxlength="40"
          input-class="font-mono"
        />

        <LazyVSelectInput
          v-model="form.segment"
          name="clientSegment"
          label="Segment"
          :options="segmentOptions"
        />

        <LazyVSelectInput
          v-model="form.tier"
          name="clientTier"
          label="Account tier"
          :options="tierOptions"
        />

        <LazyVSelectInput
          v-model="form.status"
          name="clientStatus"
          label="Status"
          :options="statusChoices"
        />

        <LazyVInput
          v-model="form.paymentTerms"
          name="clientPayment"
          label="Payment terms"
          optional
          maxlength="120"
        />

        <LazyVTextarea
          v-model="form.deliveryAddress"
          name="clientAddress"
          label="Delivery address"
          optional
          rows="2"
          maxlength="200"
          class="sm:col-span-2"
        />
      </div>

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
        form="customer-form"
        :loading="loading"
        icon="lucide:check"
        >{{ customer ? "Save changes" : "Register client" }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { segmentOptions, statusMeta, tierOptions } from "~/data/customer-meta";
import type {
  Customer,
  CustomerInput,
  CustomerStatus,
} from "~/types/admin/customers";

const props = defineProps<{ customer: Customer | null }>();

const emit = defineEmits<{
  saved: [customer: Customer, mode: "create" | "edit"];
}>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

const statusChoices = (Object.keys(statusMeta) as CustomerStatus[]).map(
  (value) => ({ value, label: statusMeta[value].label }),
);

const blank = (): CustomerInput => ({
  name: "",
  org: "",
  role: "",
  email: "",
  phone: "",
  node: "",
  segment: "business",
  tier: "A",
  status: "active",
  taxId: "",
  deliveryAddress: "",
  paymentTerms: "Net-30 invoice, bank transfer",
});

const form = reactive<CustomerInput>(blank());
const error = ref("");
const loading = ref(false);

const { validate, resetForm } = useForm();

// Fill the form each time the dialog opens: the client's values when editing, blanks when adding.
watch(open, (isOpen) => {
  if (!isOpen) return;
  const c = props.customer;
  Object.assign(
    form,
    c
      ? {
          name: c.name,
          org: c.org,
          role: c.role,
          email: c.email,
          phone: c.phone,
          node: c.node,
          segment: c.segment,
          tier: c.tier,
          status: c.status,
          taxId: c.taxId,
          deliveryAddress: c.deliveryAddress,
          paymentTerms: c.paymentTerms,
        }
      : blank(),
  );
  error.value = "";
  resetForm();
});

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
  const editing = props.customer;
  try {
    const saved = await $fetch<Customer>(
      editing ? `/api/admin/customers/${editing.id}` : "/api/admin/customers",
      {
        method: editing ? "PATCH" : "POST",
        body: { ...form },
      },
    );
    toast.success(editing ? "Client updated" : "Client registered", {
      description: saved.name,
    });
    emit("saved", saved, editing ? "edit" : "create");
    open.value = false;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    error.value =
      status === 409
        ? "A client with that email is already registered."
        : "The client could not be saved. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>