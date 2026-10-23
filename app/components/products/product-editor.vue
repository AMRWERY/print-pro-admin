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
          ? 'Register a new SKU with its pricing, inventory, variants and search listing.'
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
          :disabled="!dirty || saving"
          @click="discard"
          >Discard changes</LazyVButton
        >

        <LazyVButton
          variant="secondary"
          icon="lucide:save"
          :loading="saving === 'draft'"
          :disabled="!!saving"
          @click="save('draft')"
          >Save draft</LazyVButton
        >

        <LazyVButton
          icon="lucide:rocket"
          :loading="saving === 'published'"
          :disabled="!!saving"
          @click="save('published')"
          >{{ mode === "create" ? "Publish SKU" : "Update SKU" }}</LazyVButton
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
      class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
      novalidate
      @submit.prevent
    >
      <div class="min-w-0 space-y-4">
        <product-identity-section :form="form" :mode="mode" />

        <product-media-section :form="form" />

        <product-pricing-section :form="form" />

        <product-inventory-section :form="form" :ean="ean" />

        <product-variants-section :form="form" />

        <product-specs-section :form="form" />

        <product-dimensions-section :form="form" />

        <product-seo-section :form="form" />
      </div>
      <product-sidebar
        :form="form"
        :revisions="revisions"
        :bundled-options="bundledOptions"
      />
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
import type {
  Product,
  ProductFormValues,
  ProductRevision,
  Publication,
} from "~/types/admin/products";
import type { Tone } from "~/types/admin/dashboard";

const props = defineProps<{
  initial: ProductFormValues;
  mode: "create" | "edit";
  productId?: string;
  ean?: string;
  revisions: ProductRevision[];
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
  { id: "variants", label: "Variants" },
  { id: "specs", label: "Specifications" },
  { id: "dimensions", label: "Dimensions" },
  { id: "seo", label: "Search listing" },
];

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const form = reactive<ProductFormValues>(clone(props.initial));
let snapshot = JSON.stringify(form);

const dirty = computed(() => JSON.stringify(form) !== snapshot);

const jump = (id: string) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

// Items that can be paired with this product (machines and supplies).
const { data: pairable } = useFetch<{ rows: Product[] }>(
  "/api/admin/products",
  {
    lazy: true,
    query: { category: "inks-toner", perPage: 10 },
  },
);

const { data: pairableInks } = useFetch<{ rows: Product[] }>(
  "/api/admin/products",
  {
    lazy: true,
    query: { category: "copiers", perPage: 10 },
  },
);

const bundledOptions = computed(() =>
  [
    ...(pairable.value?.rows ?? []).slice(0, 3),
    ...(pairableInks.value?.rows ?? []).slice(0, 3),
  ].filter((p) => p.id !== props.productId),
);

const discard = () => {
  Object.assign(form, clone(JSON.parse(snapshot)));
};

// --- Saving ---
const { validate } = useForm();
const saving = ref<"" | Publication>("");
const formError = ref("");

const save = async (publication: Publication) => {
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

  form.publication = publication;
  // Variants without a price take the listing price.
  form.variants.forEach((v) => {
    if (!v.price) v.price = Number(form.price) || 0;
  });

  saving.value = publication;
  try {
    const saved = await $fetch<Product>(
      props.mode === "edit"
        ? `/api/admin/products/${props.productId}`
        : "/api/admin/products",
      { method: props.mode === "edit" ? "PATCH" : "POST", body: clone(form) },
    );
    snapshot = JSON.stringify(form);
    allowLeave = true;
    toast.success(
      publication === "published"
        ? props.mode === "create"
          ? "SKU published"
          : "SKU updated"
        : "Draft saved",
      { description: saved.name },
    );
    emit("saved", saved);
    if (props.mode === "create")
      await navigateTo(localePath(`/products/${saved.id}`));
    else allowLeave = false;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    allowLeave = false;
    formError.value =
      status === 409
        ? "A product with that SKU already exists. Use a different SKU."
        : "The product could not be saved. Check the details and try again.";
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