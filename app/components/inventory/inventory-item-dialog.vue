<template>
  <LazyVDialog
    v-model:open="open"
    :title="item ? 'Edit inventory item' : 'Add inventory item'"
    :description="
      item
        ? 'Changes to the count and the location are written to the movement ledger.'
        : 'Registers a new SKU and books its starting stock into a vault.'
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
          v-model="form.vault"
          name="itemVault"
          label="Vault"
          required
          rules="required"
          :options="vaultChoices"
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
        >{{ item ? "Save changes" : "Add item" }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { vaultLabel } from "~/data/inventory-meta";
import { categoryMeta } from "~/data/product-meta";
import type { InventoryItem, ItemInput, Vault } from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

const props = defineProps<{ item: InventoryItem | null }>();
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

const vaultChoices = (Object.keys(vaultLabel) as Vault[]).map((value) => ({
  value,
  label: vaultLabel[value],
}));

const blank = (): ItemInput => ({
  name: "",
  sku: "",
  category: "cameras",
  brand: "",
  price: null as unknown as number,
  stock: 0,
  min: 1,
  vault: "FKT-01",
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
          name: i.name,
          sku: i.sku,
          category: i.category,
          brand: i.brand,
          price: i.price,
          stock: i.stock,
          min: i.min,
          vault: i.vault,
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
  const editing = props.item;
  try {
    const saved = await $fetch<InventoryItem>(
      editing
        ? `/api/admin/inventory/items/${editing.id}`
        : "/api/admin/inventory/items",
      { method: editing ? "PATCH" : "POST", body: { ...form } },
    );
    toast.success(editing ? "Item updated" : "Item added", {
      description: saved.name,
    });
    emit("done", saved, editing ? "edit" : "create");
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