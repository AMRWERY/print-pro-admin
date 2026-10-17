<template>
  <LazyVDialog
    v-model:open="open"
    title="Stock adjustment / transfer"
    description="Correct a count after an audit, or move an item to another vault. Every change is written to the ledger."
    size="lg"
  >
    <form id="stock-form" class="space-y-4" novalidate @submit.prevent="submit">
      <inventory-product-picker v-model="product" :changeable="!fixed" />

      <template v-if="product">
        <LazyVSegmented v-model="tab" label="Action" :options="tabOptions" />

        <template v-if="tab === 'adjust'">
          <LazyVSegmented
            v-model="mode"
            label="Adjustment type"
            :options="modeOptions"
          />

          <div class="grid gap-4 sm:grid-cols-2">
            <LazyVInput
              :key="mode"
              v-model="qty"
              name="qty"
              type="number"
              :label="
                mode === 'delta'
                  ? 'Change in units (use a minus to remove)'
                  : 'Counted units'
              "
              required
              :rules="
                mode === 'set'
                  ? 'required|integer|min_value:0'
                  : 'required|integer'
              "
              step="1"
            />
            <div
              class="rounded-card border border-line bg-ink p-3"
              aria-live="polite"
            >
              <p class="label-caps">Stock after</p>
              <p
                v-if="next !== null"
                class="font-display text-2xl font-bold tabular-nums"
                :class="next < 0 ? 'text-accent' : ''"
              >
                {{ product.stock }} <span class="text-mute">→</span> {{ next }}
              </p>
              <p v-else class="text-sm text-mute">Enter a quantity.</p>

              <p
                v-if="next !== null && next < 0"
                class="mt-1 text-xs text-accent"
              >
                Stock can't go below zero.
              </p>
            </div>
          </div>

          <LazyVInput
            v-model="reason"
            name="reason"
            label="Reason"
            required
            rules="required|min:3|max:200"
            maxlength="200"
            placeholder="Cycle count, damaged in handling, QA destructive test…"
          />
        </template>

        <template v-else>
          <LazyVSelectInput
            v-model="vault"
            name="vault"
            label="Move to vault"
            required
            rules="required"
            :options="vaultChoices"
          />
          <p class="callout">
            <Icon
              name="lucide:info"
              size="14"
              class="bullet-icon"
              aria-hidden="true"
            />
            <span
              >Currently kept in
              <strong>{{ vaultLabel[product.vault] }}</strong> ({{
                product.bin
              }}). The whole stock record moves.</span
            >
          </p>
        </template>
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
        form="stock-form"
        :loading="loading"
        :disabled="!product || (tab === 'adjust' && next !== null && next < 0)"
        icon="lucide:check"
        >{{ tab === "adjust" ? "Record adjustment" : "Move item" }}</LazyVButton
      >
    </template>
  </LazyVDialog>
</template>

<script lang="ts" setup>
import { vaultLabel } from "~/data/inventory-meta";
import type { InventoryItem, Vault } from "~/types/admin/inventory";

const props = defineProps<{ item: InventoryItem | null }>();

const emit = defineEmits<{ done: [item: InventoryItem] }>();

const open = defineModel<boolean>("open", { default: false });

const toast = useToast();

const tabOptions = [
  { value: "adjust" as const, label: "Adjust stock" },
  { value: "transfer" as const, label: "Move to another vault" },
];
const modeOptions = [
  { value: "delta" as const, label: "Add or remove" },
  { value: "set" as const, label: "Set counted total" },
];

const product = ref<InventoryItem | null>(null);
const fixed = ref(false);
const tab = ref<"adjust" | "transfer">("adjust");
const mode = ref<"delta" | "set">("delta");
const qty = ref<number | null>(null);
const reason = ref("");
const vault = ref<Vault | "">("");
const error = ref("");
const loading = ref(false);

const { validate, resetForm } = useForm();

// Start fresh each time the dialog opens; a row's Adjust button pre-selects its product.
watch(open, (isOpen) => {
  if (!isOpen) return;
  product.value = props.item;
  fixed.value = !!props.item;
  tab.value = "adjust";
  mode.value = "delta";
  qty.value = null;
  reason.value = "";
  vault.value = "";
  error.value = "";
  resetForm();
});

const vaultChoices = computed(() => [
  { value: "", label: "Select a vault…" },
  ...(Object.keys(vaultLabel) as Vault[])
    .filter((v) => v !== product.value?.vault)
    .map((v) => ({ value: v, label: vaultLabel[v] })),
]);

const next = computed(() => {
  if (!product.value || typeof qty.value !== "number") return null;
  return mode.value === "set" ? qty.value : product.value.stock + qty.value;
});

const submit = async () => {
  if (!product.value) return;
  const { valid } = await validate();
  if (!valid) return;

  loading.value = true;
  error.value = "";
  try {
    const updated = await $fetch<InventoryItem>(
      tab.value === "adjust"
        ? "/api/admin/inventory/adjust"
        : "/api/admin/inventory/transfer",
      {
        method: "POST",
        body:
          tab.value === "adjust"
            ? {
                productId: product.value.id,
                mode: mode.value,
                qty: qty.value,
                reason: reason.value,
              }
            : { productId: product.value.id, vault: vault.value },
      },
    );
    toast.success(tab.value === "adjust" ? "Stock adjusted" : "Item moved", {
      description: updated.name,
    });
    emit("done", updated);
    open.value = false;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    error.value =
      status === 409
        ? "That would put the stock below zero or over the limit."
        : status === 400
          ? "Nothing to change. Check the quantity or the vault."
          : "The change could not be saved. Try again.";
  } finally {
    loading.value = false;
  }
};
</script>