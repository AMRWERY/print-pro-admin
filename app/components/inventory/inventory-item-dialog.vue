<template>
  <LazyVDialog
    v-model:open="open"
    :title="editing ? 'Edit inventory item' : copy ? 'Duplicate inventory item' : 'Add inventory item'"
    :description="
      editing
        ? 'Changes to the count and the location are written to the movement history.'
        : 'Registers a new SKU and books its starting stock into a warehouse.'
    "
    size="lg"
  >
    <form id="item-form" class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="itemName"
          label="Product name"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          class="sm:col-span-2"
        />

        <LazyVInput
          v-model="form.sku"
          name="itemSku"
          label="SKU"
          required
          rules="required|min:3|max:31"
          hint="Letters, numbers and dashes. Must be unique."
          input-class="font-mono uppercase"
        />

        <LazyVInput
          v-model="form.brand"
          name="itemBrand"
          label="Brand / make"
          required
          rules="required|min:2|max:60"
          maxlength="60"
        />

        <LazyVSelectInput
          v-model="form.category"
          name="itemCategory"
          label="Division"
          required
          rules="required"
          :options="categoryChoices"
        />

        <LazyVInput
          v-model="form.price"
          name="itemPrice"
          type="number"
          label="Unit value"
          required
          rules="required|min_value:0"
          min="0"
          step="0.01"
        />

        <LazyVInput
          v-model="form.stock"
          name="itemStock"
          type="number"
          label="Units in stock"
          required
          rules="required|integer|min_value:0"
          min="0"
        />

        <LazyVInput
          v-model="form.min"
          name="itemMin"
          type="number"
          label="Reorder point"
          required
          rules="required|integer|min_value:0"
          min="0"
          hint="At or below this the item shows as low stock."
        />

        <LazyVSelectInput
          v-model="form.warehouse"
          name="itemWarehouse"
          label="Warehouse"
          required
          rules="required"
          :options="warehouseChoices"
        />

        <LazyVInput
          v-model="form.bin"
          name="itemBin"
          label="Bin location"
          required
          rules="required|min:2|max:20"
          maxlength="20"
          placeholder="B4-02"
          input-class="font-mono uppercase"
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
        form="item-form"
        :loading="loading"
        icon="lucide:check"
        >{{ editing ? "Save changes" : "Add item" }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { warehouseLabel } from "~/data/inventory-meta";
import { categoryMeta } from "~/data/product-meta";
import type { InventoryItem, ItemInput, Warehouse } from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

const props = defineProps<{
  item: InventoryItem | null;
  /** Start from `item` but register it as a new SKU. */
  copy?: boolean;
}>();

const editing = computed(() => !!props.item && !props.copy);
const emit = defineEmits<{
  done: [item: InventoryItem, mode: "create" | "edit"];
}>();
const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

const categoryChoices = (Object.keys(categoryMeta) as ProductCategory[]).map(
  (value) => ({
    value,
    label: categoryMeta[value].label,
  }),
);

const warehouseChoices = (Object.keys(warehouseLabel) as Warehouse[]).map((value) => ({
  value,
  label: warehouseLabel[value],
}));

const blank = (): ItemInput => ({
  name: "",
  sku: "",
  category: "printers",
  brand: "",
  price: null as unknown as number,
  stock: 0,
  min: 1,
  warehouse: "CAI-01",
  bin: "",
});

const form = reactive<ItemInput>(blank());
const error = ref("");
const loading = ref(false);

const { validate, resetForm } = useForm();

// Fill the form each time the dialog opens: the item's values when editing, blanks when adding.
watch(open, (isOpen) => {
  if (!isOpen) return;
  const i = props.item;
  Object.assign(
    form,
    i
      ? {
          name: props.copy ? `${i.name} (copy)` : i.name,
          sku: props.copy ? `${i.sku}-COPY` : i.sku,
          category: i.category,
          brand: i.brand,
          price: i.price,
          stock: i.stock,
          min: i.min,
          warehouse: i.warehouse,
          bin: i.bin,
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
  const target = editing.value ? props.item : null;
  try {
    const saved = await $fetch<InventoryItem>(
      target ? `/api/admin/inventory/items/${target.id}` : "/api/admin/inventory/items",
      { method: target ? "PATCH" : "POST", body: { ...form } },
    );
    toast.success(target ? "Item updated" : "Item added", { description: saved.name });
    emit("done", saved, target ? "edit" : "create");
    open.value = false;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    error.value =
      status === 409
        ? "An item with that SKU already exists. Use a different SKU."
        : "The item could not be saved. Check the details and try again.";
  } finally {
    loading.value = false;
  }
};
</script>