<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="
        mode === 'create' ? 'Add new product / SKU' : `Edit ${initial.name}`
      "
      :breadcrumb="[
        { label: 'Dashboard', to: '/' },
        { label: 'Products', to: '/products' },
        { label: mode === 'create' ? 'New product' : initial.sku },
      ]"
      :description="
        mode === 'create'
          ? 'Add a product with its price and stock. Everything else is optional.'
          : undefined
      "
    >
      <template #meta>
        <p class="flex flex-wrap items-center gap-2">
          <LazyVStatusBadge :tone="publicationMeta[form.publication].tone">{{
            publicationMeta[form.publication].label
          }}</LazyVStatusBadge>

          <LazyVStatusBadge v-if="dirty" tone="warning" icon="lucide:pencil"
            >Unsaved changes</LazyVStatusBadge
          >

          <span
            v-else-if="mode === 'edit'"
            class="font-mono text-2xs text-success"
            >All changes saved</span
          >
        </p>
      </template>
      <template #actions>
        <LazyVButton
          variant="tertiary"
          :disabled="!dirty || !!saving"
          @click="discard"
          >Discard changes</LazyVButton
        >

        <LazyVButton
          variant="secondary"
          icon="lucide:save"
          :loading="saving === 'continue'"
          :disabled="!!saving"
          @click="save(true)"
          >Save &amp; Continue</LazyVButton
        >

        <LazyVButton
          icon="lucide:check"
          :loading="saving === 'exit'"
          :disabled="!!saving"
          @click="save(false)"
          >Save SKU</LazyVButton
        >
      </template>
    </LazyVPageHeader>

    <!-- Section jump links: single-screen scroll with anchors -->
    <nav
      aria-label="Editor sections"
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
      title="Leave without saving?"
      description="This product has changes that haven't been saved."
    >
      <template #footer>
        <LazyVButton variant="secondary" @click="leaveOpen = false"
          >Keep editing</LazyVButton
        >

        <LazyVButton icon="lucide:log-out" @click="leave"
          >Discard and leave</LazyVButton
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

const toast = useToast();
const localePath = useLocalePath();

const publicationMeta: Record<Publication, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Active · published", tone: "success" },
  archived: { label: "Archived", tone: "warning" },
};

const sections = [
  { id: "identity", label: "General info" },
  { id: "media", label: "Media & assets" },
  { id: "pricing", label: "Pricing" },
  { id: "inventory", label: "Inventory & stock" },
  { id: "specs", label: "Specifications" },
  { id: "dimensions", label: "Dimensions" },
];

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
const fieldLabels: Record<string, string> = {
  name: "Product title",
  category: "Category",
  sku: "SKU",
  brand: "Brand",
  price: "Price",
  stock: "Stock on hand",
  min: "Low-stock alert",
};
const saving = ref<"" | "continue" | "exit">("");
const formError = ref("");

/** Saves the product. `stay`: keep the form open ("Save & Continue") instead of going back to the list. */
const save = async (stay: boolean) => {
  if (saving.value) return;
  formError.value = "";

  const result = await validate();
  if (!result.valid) {
    formError.value =
      "Some fields need attention. Fix the highlighted fields and try again.";
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
    toast.success(props.mode === "create" ? "SKU saved" : "SKU updated", { description: saved.name });
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
      formError.value = `Please fix: ${names.map((n) => fieldLabels[n] ?? n).join(", ")}. Each one is marked below.`;
      await nextTick();
      const bad = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      bad?.scrollIntoView({ behavior: "smooth", block: "center" });
      bad?.focus({ preventScroll: true });
    } else {
      formError.value =
        status === 409
          ? "A product with that SKU already exists. Use a different SKU."
          : status === 0 || status >= 500
            ? "The server could not be reached or had a problem. Try again in a moment."
            : "The product could not be saved. Check the details and try again.";
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