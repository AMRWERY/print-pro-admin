<template>
  <LazyVDialog
    v-model:open="open"
    :title="customer ? $t('customers_ui.dialog_title_edit') : $t('customers_ui.dialog_title_create')"
    :description="
      customer
        ? $t('customers_ui.dialog_desc_edit')
        : $t('customers_ui.dialog_desc_create')
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
          :label="$t('customers_ui.full_name')"
          required
          rules="required|min:2|max:80"
          maxlength="80"
        />

        <LazyVInput
          v-model="form.role"
          name="clientRole"
          :label="$t('customers_ui.role_title')"
          optional
          maxlength="100"
        />

        <LazyVInput
          v-model="form.org"
          name="clientOrg"
          :label="$t('customers_ui.organization')"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          class="sm:col-span-2"
        />

        <LazyVInput
          v-model="form.email"
          name="clientEmail"
          type="email"
          :label="$t('customers_ui.primary_email')"
          required
          rules="required|email"
        />

        <LazyVInput
          v-model="form.phone"
          name="clientPhone"
          type="tel"
          :label="$t('customers_ui.direct_line')"
          optional
          maxlength="30"
        />

        <LazyVInput
          v-model="form.node"
          name="clientRegion"
          :label="$t('customers_ui.region_branch')"
          optional
          maxlength="60"
          :placeholder="$t('customers_ui.region_placeholder')"
        />

        <LazyVInput
          v-model="form.taxId"
          name="clientTax"
          :label="$t('customers_ui.tax_id')"
          optional
          maxlength="40"
          input-class="font-mono"
        />

        <LazyVSelectInput
          v-model="form.segment"
          name="clientSegment"
          :label="$t('customers_ui.col_segment')"
          :options="segmentOptions"
        />

        <LazyVSelectInput
          v-model="form.tier"
          name="clientTier"
          :label="$t('customers_ui.col_tier')"
          :options="tierOptions"
        />

        <LazyVSelectInput
          v-model="form.status"
          name="clientStatus"
          :label="$t('common_ui.status')"
          :options="statusChoices"
        />

        <LazyVInput
          v-model="form.paymentTerms"
          name="clientPayment"
          :label="$t('customers_ui.payment_terms')"
          optional
          maxlength="120"
        />

        <LazyVTextarea
          v-model="form.deliveryAddress"
          name="clientAddress"
          :label="$t('customers_ui.billing_address')"
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
        >{{ $t('btn.cancel') }}</LazyVButton
      >

      <LazyVButton
        type="submit"
        form="customer-form"
        :loading="loading"
        icon="lucide:check"
        >{{ customer ? $t('btn.save_changes') : $t('btn.register_customer') }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import type {
  Customer,
  CustomerInput,
  CustomerSegment,
  CustomerStatus,
  CustomerTier,
} from "~/types/admin/customers";

const props = defineProps<{ customer: Customer | null }>();

const emit = defineEmits<{
  saved: [customer: Customer, mode: "create" | "edit"];
}>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();
const { t } = useI18n();

const statusChoices = computed<{ value: CustomerStatus; label: string }[]>(() => [
  { value: "active", label: t("customers_ui.status_active") },
  { value: "audit", label: t("customers_ui.status_audit") },
  { value: "dormant", label: t("customers_ui.status_dormant") },
]);

const segmentOptions = computed<{ value: CustomerSegment; label: string }[]>(() => [
  { value: "enterprise", label: t("customers_ui.segment_enterprise") },
  { value: "business", label: t("customers_ui.segment_business") },
  { value: "printShop", label: t("customers_ui.segment_print_shop") },
  { value: "home", label: t("customers_ui.segment_home") },
  { value: "highLtv", label: t("customers_ui.segment_high_ltv") },
]);

const tierOptions = computed<{ value: CustomerTier; label: string }[]>(() => [
  { value: "AAA", label: t("customers_ui.tier_aaa") },
  { value: "AA", label: t("customers_ui.tier_aa") },
  { value: "A", label: t("customers_ui.tier_a") },
]);

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
  paymentTerms: t("customers_ui.default_payment_terms"),
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
    const customers = useCustomersStore();
    const saved = await (editing
      ? customers.update(editing.id, { ...form })
      : customers.create({ ...form }));
    toast.success(editing ? t("customers_ui.toast_updated") : t("customers_ui.toast_registered"), {
      description: saved.name,
    });
    emit("saved", saved, editing ? "edit" : "create");
    open.value = false;
  } catch (e) {
    const status = statusOf(e);
    error.value =
      status === 409
        ? t("customers_ui.error_email_taken")
        : t("customers_ui.error_save_failed");
  } finally {
    loading.value = false;
  }
};
</script>