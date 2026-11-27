<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="
        mode === 'create'
          ? $t('products_ui.editor_create_title')
          : $t('products_ui.editor_edit_title', { name: initial.name })
      "
      :breadcrumb="[
        { label: $t('nav.dashboard'), to: '/' },
        { label: $t('nav.products'), to: '/products' },
        { label: mode === 'create' ? $t('products_ui.new_product') : initial.sku },
      ]"
      :description="
        mode === 'create'
          ? $t('products_ui.editor_desc')
          : undefined
      "
    >
      <template #meta>
        <p class="flex flex-wrap items-center gap-2">
          <LazyVStatusBadge :tone="publicationMeta[form.publication].tone">{{
            publicationMeta[form.publication].label
          }}</LazyVStatusBadge>

          <LazyVStatusBadge v-if="dirty" tone="warning" icon="lucide:pencil"
            >{{ $t('common_ui.unsaved_changes') }}</LazyVStatusBadge
          >

          <span
            v-else-if="mode === 'edit'"
            class="font-mono text-2xs text-success"
            >{{ $t('common_ui.all_changes_saved') }}</span
          >
        </p>
      </template>
      <template #actions>
        <LazyVButton
          variant="tertiary"
          :disabled="!dirty || !!saving"
          @click="discard"
          >{{ $t('btn.discard_changes') }}</LazyVButton
        >

        <LazyVButton
          variant="secondary"
          icon="lucide:save"
          :loading="saving === 'continue'"
          :disabled="!!saving"
          @click="save(true)"
          >{{ $t('btn.save_and_continue') }}</LazyVButton
        >

        <LazyVButton
          icon="lucide:check"
          :loading="saving === 'exit'"
          :disabled="!!saving"
          @click="save(false)"
          >{{ $t('btn.save_sku') }}</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- Section jump links: single-screen scroll with anchors -->
    <nav
      :aria-label="$t('products_ui.editor_sections')"
      class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
    >
      <a
        v-for="s in sections"
        :key="s.id"
        :href="`#${s.id}`"
        class="chip-link shrink-0 whitespace-nowrap"
        @click.prevent="jump(s.id)"
        >{{ s.label }}</a
      >
    </nav>

    <p v-if="formError" class="callout-accent" role="alert">
      <Icon
        name="lucide:circle-alert"
        size="16"
        class="bullet-icon"
        aria-hidden="true"
      />
      {{ formError }}
    </p>

    <form
      class="grid gap-4"
      novalidate
      @submit.prevent
    >
      <div class="min-w-0 space-y-8">
        <product-identity-section :form="form" />

        <product-media-section :form="form" />

        <product-pricing-section :form="form" />

        <product-inventory-section :form="form" />

        <product-specs-section :form="form" />

        <product-dimensions-section :form="form" />

      </div>
    </form>

    <LazyVDialog
      v-model:open="leaveOpen"
      :title="$t('products_ui.leave_title')"
      :description="$t('products_ui.leave_desc')"
    >
      <template #footer>
        <LazyVButton variant="secondary" @click="leaveOpen = false"
          >{{ $t('products_ui.keep_editing') }}</LazyVButton
        >

        <LazyVButton icon="lucide:log-out" @click="leave"
          >{{ $t('products_ui.discard_and_leave') }}</LazyVButton
        >
      </template>
    </LazyVDialog>
  </div>
</template>

<script lang="ts" setup>
import type { Product, ProductFormValues, Publication } from "~/types/admin/products";
import type { Tone } from "~/types/admin/dashboard";

const props = defineProps<{
  initial: ProductFormValues;
  mode: "create" | "edit";
  productId?: string;
}>();

const emit = defineEmits<{ saved: [product: Product] }>();

const { t } = useI18n();
const toast = useToast();
const localePath = useLocalePath();

const publicationMeta = computed<Record<Publication, { label: string; tone: Tone }>>(() => ({
  draft: { label: t("common_ui.draft"), tone: "neutral" },
  published: { label: t("products_ui.status_published"), tone: "success" },
  archived: { label: t("common_ui.archived"), tone: "warning" },
}));

const sections = computed(() => [
  { id: "identity", label: t("products_ui.sec_general") },
  { id: "media", label: t("products_ui.sec_media_assets") },
  { id: "pricing", label: t("products_ui.pricing") },
  { id: "inventory", label: t("products_ui.sec_inventory_stock") },
  { id: "specs", label: t("products_ui.specifications") },
  { id: "dimensions", label: t("products_ui.dimensions") },
]);

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const form = reactive<ProductFormValues>(clone(props.initial));
// A ref, so `dirty` notices when a save resets what counts as "unchanged".
const snapshot = ref(JSON.stringify(form));

const dirty = computed(() => JSON.stringify(form) !== snapshot.value);

const jump = (id: string) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

const productsStore = useProductsStore();

const discard = () => {
  Object.assign(form, clone(JSON.parse(snapshot.value)));
};

// --- Saving ---
const { validate, setErrors } = useForm();
// Plain names for the fields the server can complain about.
const fieldLabels = computed<Record<string, string>>(() => ({
  name: t("products_ui.product_title"),
  category: t("products_ui.field_category"),
  sku: t("products_ui.col_sku"),
  brand: t("products_ui.brand"),
  price: t("products_ui.price"),
  stock: t("products_ui.stock_on_hand"),
  min: t("products_ui.low_stock_alert"),
}));
const saving = ref<"" | "continue" | "exit">("");
const formError = ref("");

/** Saves the product. `stay`: keep the form open ("Save & Continue") instead of going back to the list. */
const save = async (stay: boolean) => {
  if (saving.value) return;
  formError.value = "";

  const result = await validate();
  if (!result.valid) {
    formError.value = t("products_ui.fix_fields_error");
    await nextTick();
    const bad = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    bad?.scrollIntoView({ behavior: "smooth", block: "center" });
    bad?.focus({ preventScroll: true });
    return;
  }

  // A saved product is a live one: it is listed on the shop (channel permitting) as soon as it is stored.
  form.publication = "published";
  saving.value = stay ? "continue" : "exit";
  try {
    const saved =
      props.mode === "edit"
        ? await productsStore.update(props.productId!, clone(form))
        : await productsStore.create(clone(form));
    snapshot.value = JSON.stringify(form);
    allowLeave = true;
    toast.success(props.mode === "create" ? t("products_ui.sku_saved") : t("products_ui.sku_updated"), { description: saved.name });
    emit("saved", saved);
    if (!stay) {
      await navigateTo(localePath("/products"));
    } else if (props.mode === "create") {
      // The new product now exists, so carry on in its edit form: saving again updates it instead of adding a copy.
      await navigateTo(localePath(`/products/${saved.id}`));
    } else {
      allowLeave = false;
    }
  } catch (e) {
    const status = statusOf(e);
    allowLeave = false;
    const fields = fieldErrorsOf(e);
    const names = Object.keys(fields);
    if (names.length) {
      // Mark each field and say which ones, so nothing has to be guessed.
      setErrors(fields);
      formError.value = t("products_ui.fix_named_error", {
        fields: names.map((n) => fieldLabels.value[n] ?? n).join(t("products_ui.list_separator")),
      });
      await nextTick();
      const bad = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      bad?.scrollIntoView({ behavior: "smooth", block: "center" });
      bad?.focus({ preventScroll: true });
    } else {
      formError.value =
        status === 409
          ? t("products_ui.sku_exists_error")
          : status === 0 || status >= 500
            ? t("products_ui.server_error")
            : t("products_ui.save_failed_error");
    }
  } finally {
    saving.value = "";
  }
};

// --- Leaving with unsaved changes ---
const leaveOpen = ref(false);
let leaveTo = "";
let allowLeave = false;

onBeforeRouteLeave((to) => {
  if (!dirty.value || allowLeave) return true;
  leaveTo = to.fullPath;
  leaveOpen.value = true;
  return false;
});

const leave = async () => {
  allowLeave = true;
  leaveOpen.value = false;
  await navigateTo(leaveTo);
};

// The browser's own prompt covers closing the tab or reloading.
useEventListener("beforeunload", (e) => {
  if (dirty.value && !allowLeave) e.preventDefault();
});
</script>