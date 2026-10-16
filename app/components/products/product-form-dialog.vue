<template>
  <LazyVDialog
    v-model:open="open"
    :title="title"
    :description="description"
    size="lg"
  >
    <form
      id="product-form"
      class="space-y-4"
      novalidate
      @submit.prevent="submit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="name"
          label="Product name"
          required
          rules="required|min:2|max:120"
          class="sm:col-span-2"
        />

        <LazyVInput
          v-model="form.sku"
          name="sku"
          label="SKU"
          required
          rules="required|min:3|max:31"
          hint="Letters, numbers and dashes. Must be unique."
          input-class="uppercase"
        />

        <LazyVInput
          v-model="form.brand"
          name="brand"
          label="Brand / make"
          required
          rules="required|min:2|max:60"
        />

        <LazyVSelectInput
          v-model="form.category"
          name="category"
          label="Category"
          required
          rules="required"
          :options="categoryChoices"
        />

        <LazyVSelectInput
          v-model="form.status"
          name="status"
          label="Status"
          :options="statusChoices"
        />

        <LazyVInput
          v-model="form.price"
          name="price"
          type="number"
          label="Unit price (EUR)"
          required
          rules="required|min_value:0"
          min="0"
          step="0.01"
        />

        <div class="grid grid-cols-2 gap-4">
          <LazyVInput
            v-model="form.stock"
            name="stock"
            type="number"
            label="Stock"
            required
            rules="required|integer|min_value:0"
            min="0"
          />

          <LazyVInput
            v-model="form.min"
            name="min"
            type="number"
            label="Reorder at"
            required
            rules="required|integer|min_value:0"
            min="0"
          />
        </div>
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
        form="product-form"
        :loading="loading"
        icon="lucide:check"
        >{{ mode === "edit" ? "Save changes" : "Register SKU" }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { categoryMeta, statusMeta } from "~/data/product-meta";
import type {
  Product,
  ProductCategory,
  ProductStatus,
} from "~/types/admin/products";

const props = defineProps<{
  /** The product being edited or copied; null when registering a new one. */
  product: Product | null;
  mode: "create" | "edit" | "duplicate";
}>();

const emit = defineEmits<{
  saved: [product: Product, mode: "create" | "edit" | "duplicate"];
}>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

const title = computed(
  () =>
    ({
      create: "Add new product / SKU",
      edit: "Edit product",
      duplicate: "Duplicate product",
    })[props.mode],
);

const description = computed(
  () =>
    ({
      create: "Registers a new SKU in the catalog and metrology ledger.",
      edit: "Changes apply to the register straight away.",
      duplicate: "Creates a new SKU from this product. Give it its own SKU.",
    })[props.mode],
);

const categoryChoices = (Object.keys(categoryMeta) as ProductCategory[]).map(
  (value) => ({
    value,
    label: categoryMeta[value].label,
  }),
);

const statusChoices = (Object.keys(statusMeta) as ProductStatus[]).map(
  (value) => ({
    value,
    label: statusMeta[value].label,
  }),
);

const blank = () => ({
  name: "",
  sku: "",
  brand: "",
  category: "cameras" as ProductCategory,
  status: "active" as ProductStatus,
  price: null as number | null,
  stock: 0 as number | null,
  min: 1 as number | null,
});

const form = reactive(blank());

const { validate, resetForm } = useForm();
const loading = ref(false);
const error = ref("");

// Fill the form each time the dialog opens, for the current mode.
watch(open, (isOpen) => {
  if (!isOpen) return;
  error.value = "";
  const p = props.product;
  Object.assign(
    form,
    p && props.mode !== "create"
      ? {
          name: props.mode === "duplicate" ? `${p.name} (copy)` : p.name,
          sku: props.mode === "duplicate" ? `${p.sku}-COPY` : p.sku,
          brand: p.brand,
          category: p.category,
          status: p.status,
          price: p.price,
          stock: p.stock,
          min: p.min,
        }
      : blank(),
  );
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
  const editing = props.mode === "edit" && props.product;
  try {
    const saved = await $fetch<Product>(
      editing
        ? `/api/admin/products/${props.product!.id}`
        : "/api/admin/products",
      { method: editing ? "PATCH" : "POST", body: { ...form } },
    );
    toast.success(editing ? "Product updated" : "SKU registered", {
      description: saved.name,
    });
    emit("saved", saved, props.mode);
    open.value = false;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    error.value =
      status === 409
        ? "A product with that SKU already exists. Use a different SKU."
        : "The product could not be saved. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>