<template>
  <LazyVDialog
    v-model:open="open"
    :title="editing ? $t('inventory_ui.dialog_edit_title') : copy ? $t('inventory_ui.dialog_dup_title') : $t('inventory_ui.dialog_add_title')"
    :description="
      editing
        ? $t('inventory_ui.dialog_desc_edit')
        : $t('inventory_ui.dialog_desc_add')
    "
    size="lg"
  >
    <form id="item-form" class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="itemName"
          :label="$t('inventory_ui.item_name')"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          class="sm:col-span-2"
        />

        <LazyVInput
          v-model="form.sku"
          name="itemSku"
          :label="$t('inventory_ui.item_sku')"
          required
          rules="required|min:3|max:31"
          :hint="$t('inventory_ui.sku_hint')"
          input-class="font-mono uppercase"
        />

        <LazyVInput
          v-model="form.brand"
          name="itemBrand"
          :label="$t('inventory_ui.item_brand')"
          required
          rules="required|min:2|max:60"
          maxlength="60"
        />

        <LazyVSelectInput
          v-model="form.category"
          name="itemCategory"
          :label="$t('inventory_ui.item_division')"
          required
          rules="required"
          :options="categoryChoices"
        />

        <LazyVInput
          v-model="form.price"
          name="itemPrice"
          type="number"
          :label="$t('inventory_ui.item_price')"
          required
          rules="required|min_value:0"
          min="0"
          step="0.01"
        />

        <LazyVInput
          v-model="form.stock"
          name="itemStock"
          type="number"
          :label="$t('inventory_ui.item_units_in_stock')"
          required
          rules="required|integer|min_value:0"
          min="0"
        />

        <LazyVInput
          v-model="form.min"
          name="itemMin"
          type="number"
          :label="$t('inventory_ui.item_reorder_point')"
          required
          rules="required|integer|min_value:0"
          min="0"
          :hint="$t('inventory_ui.item_reorder_hint')"
        />

        <LazyVSelectInput
          v-model="form.warehouse"
          name="itemWarehouse"
          :label="$t('inventory_ui.warehouse')"
          required
          rules="required"
          :options="warehouseChoices"
        />

        <LazyVInput
          v-model="form.bin"
          name="itemBin"
          :label="$t('inventory_ui.bin_location')"
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
        >{{ $t('btn.cancel') }}</LazyVButton
      >

      <LazyVButton
        type="submit"
        form="item-form"
        :loading="loading"
        icon="lucide:check"
        >{{ editing ? $t('btn.save_changes') : $t('btn.add_item') }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { warehouseLabel } from "~/data/inventory-meta";
import type { InventoryItem, ItemInput, Warehouse } from "~/types/admin/inventory";
import type { ProductCategory } from "~/types/admin/products";

const categories = useCategories();

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
const { t } = useI18n();

const categoryChoices = computed(() => categories.options());

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
          name: props.copy ? t('inventory_ui.item_copy_name', { name: i.name }) : i.name,
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
    const store = useInventoryStore();
    const saved = target
      ? await store.updateItem(target.id, { ...form })
      : await store.createItem({ ...form });
    toast.success(target ? t('inventory_ui.toast_item_updated') : t('inventory_ui.toast_item_added'), { description: saved.name });
    emit("done", saved, target ? "edit" : "create");
    open.value = false;
  } catch (e) {
    const status = statusOf(e);
    error.value =
      status === 409
        ? t('inventory_ui.error_sku_exists')
        : t('inventory_ui.error_item_save');
  } finally {
    loading.value = false;
  }
};
</script>