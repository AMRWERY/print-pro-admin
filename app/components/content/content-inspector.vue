<template>
  <LazyVPanel
    :title="block ? 'Slot inspector' : 'New content block'"
    :subtitle="
      block
        ? `Live preview · ${kindMeta[form.kind].slot}`
        : 'Draft, preview, then publish'
    "
    :icon="block ? 'lucide:panels-top-left' : 'lucide:circle-plus'"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        aria-label="Close"
        @click="emit('close')"
      />
    </template>

    <!-- Responsive preview: follows the form as you type -->
    <section class="space-y-3" aria-labelledby="cb-preview">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 id="cb-preview" class="label-caps">Responsive preview</h3>

        <LazyVSegmented
          v-model="device"
          label="Preview device"
          :options="deviceOptions"
        />
      </div>
      <div class="rounded-card bg-ink p-3">
        <content-preview
          :block="form"
          :device="device"
          :caption="`${deviceMeta[device].label} preview of ${form.title}`"
        />
      </div>
      <p class="meta text-center font-mono">
        {{ deviceMeta[device].label }} · {{ deviceMeta[device].px }}px wide
      </p>
    </section>

    <form
      id="content-form"
      class="mt-5 space-y-5"
      novalidate
      @submit.prevent="submit"
    >
      <section class="space-y-3" aria-labelledby="cb-copy">
        <h3 id="cb-copy" class="label-caps">01 // Placement &amp; copy</h3>

        <LazyVSelectInput
          v-model="form.kind"
          name="cbKind"
          label="Content type"
          :options="kindOptions"
          :hint="kindMeta[form.kind].hint"
        />

        <LazyVInput
          v-model="form.title"
          name="cbTitle"
          label="Headline"
          required
          rules="required|min:2|max:120"
          maxlength="120"
        />

        <LazyVTextarea
          v-model="form.subtitle"
          name="cbSubtitle"
          label="Supporting text"
          optional
          rows="3"
          maxlength="240"
        />
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVInput
            v-model="form.ctaLabel"
            name="cbCta"
            label="Button label"
            optional
            maxlength="30"
          />

          <LazyVInput
            v-model="form.link"
            name="cbLink"
            label="Links to"
            required
            :rules="linkRule"
            maxlength="200"
            placeholder="/cameras-optics/…"
            input-class="font-mono"
            dir="ltr"
          />
        </div>
      </section>

      <section class="space-y-3" aria-labelledby="cb-media">
        <h3 id="cb-media" class="label-caps">02 // Image &amp; artwork</h3>

        <div
          v-if="isUpload"
          class="flex items-center gap-3 rounded-control border border-line bg-ink px-3 py-2"
        >
          <Icon name="lucide:image" size="16" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-sm">{{
            uploadName || "Uploaded image"
          }}</span>

          <LazyVButton
            variant="tertiary"
            size="sm"
            icon="lucide:trash-2"
            @click="clearImage"
            >Remove</LazyVButton
          >
        </div>

        <LazyVInput
          v-else
          v-model="form.imageUrl"
          name="cbImage"
          label="Image address"
          optional
          :rules="imageRule"
          placeholder="https://… or /img/…"
          input-class="font-mono"
          dir="ltr"
        />

        <div class="flex flex-wrap items-center gap-2">
          <input
            ref="fileEl"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            class="sr-only"
            tabindex="-1"
            aria-label="Upload an image"
            @change="onFile"
          />

          <LazyVButton
            variant="secondary"
            size="sm"
            icon="lucide:upload"
            @click="fileEl?.click()"
            >Upload image</LazyVButton
          >

          <span class="meta"
            >PNG, JPG, WebP, AVIF or GIF up to 1 MB. Without a picture the
            artwork below is used.</span
          >
        </div>

        <p v-if="uploadError" class="callout-accent" role="alert">
          <Icon
            name="lucide:circle-alert"
            size="16"
            class="bullet-icon"
            aria-hidden="true"
          />
          {{ uploadError }}
        </p>

        <LazyVInput
          v-model="form.imageAlt"
          name="cbAlt"
          label="Image description (alt text)"
          optional
          maxlength="160"
          hint="Read aloud by screen readers. Blocks without it are flagged on the dashboard."
        />

        <fieldset>
          <legend class="label">Artwork colour</legend>
          <div class="mt-1.5 flex flex-wrap gap-2">
            <label
              v-for="p in paletteOptions"
              :key="p.value"
              class="cursor-pointer"
            >
              <input
                v-model="form.palette"
                type="radio"
                name="cbPalette"
                :value="p.value"
                class="peer sr-only"
              />
              <span
                class="flex items-center gap-2 rounded-control border border-line bg-surface px-2.5 py-1.5 text-xs transition duration-fast hover:border-accent/60 peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:ring-2 peer-focus-visible:ring-cyan"
              >
                <span
                  class="h-3.5 w-3.5 rounded-full"
                  :style="{ background: paletteMeta[p.value].swatch }"
                  aria-hidden="true"
                />
                {{ p.label }}
              </span>
            </label>
          </div>
        </fieldset>
      </section>

      <section class="space-y-3" aria-labelledby="cb-schedule">
        <h3 id="cb-schedule" class="label-caps">
          03 // Scheduling &amp; publishing
        </h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVDatePicker
            v-model="form.startsAt"
            name="cbStart"
            label="Goes live (UTC)"
            optional
            clearable
            :shortcuts="false"
            placeholder="Immediately"
          />

          <LazyVDatePicker
            v-model="form.endsAt"
            name="cbEnd"
            label="Expires (UTC)"
            optional
            clearable
            :shortcuts="false"
            placeholder="Never expires"
            :min="form.startsAt || undefined"
          />
        </div>

        <LazyVSelectInput
          v-model="form.status"
          name="cbStatus"
          label="Status"
          :options="statusChoices"
        />
        <p class="callout" aria-live="polite">
          <Icon
            name="lucide:info"
            size="14"
            class="bullet-icon"
            aria-hidden="true"
          />
          <span>{{ scheduleNote }}</span>
        </p>
      </section>

      <p v-if="shownError" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ shownError }}
      </p>
    </form>

    <div
      class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4"
    >
      <LazyVButton
        v-if="block"
        variant="tertiary"
        icon="lucide:trash-2"
        class="!text-accent"
        :disabled="saving"
        @click="emit('remove')"
        >Delete block</LazyVButton
      >

      <span v-else />

      <div class="flex flex-wrap items-center gap-2">
        <LazyVButton
          v-if="dirty"
          variant="tertiary"
          icon="lucide:undo-2"
          :disabled="saving"
          @click="revert"
          >Revert</LazyVButton
        >

        <LazyVButton
          type="submit"
          form="content-form"
          :loading="saving"
          icon="lucide:save"
          >{{ block ? "Save changes" : "Create block" }}</LazyVButton
        >
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import {
  deviceMeta,
  deviceOptions,
  kindMeta,
  kindOptions,
  paletteMeta,
  paletteOptions,
  statusChoices,
  windowLabel,
} from "~/data/content-meta";
import type {
  BlockInput,
  ContentBlock,
  PreviewDevice,
} from "~/types/admin/content";

const props = defineProps<{
  /** The block being edited; null when creating. */
  block: ContentBlock | null;
  /** For a duplicate: the settings to start from, in a new block. */
  seed?: ContentBlock | null;
  saving?: boolean;
  error?: string;
}>();

const emit = defineEmits<{
  save: [values: BlockInput];
  remove: [];
  close: [];
}>();

const start = (): BlockInput => {
  const b = props.block ?? props.seed ?? null;
  return {
    kind: b?.kind ?? "hero",
    title: b?.title ?? "",
    subtitle: b?.subtitle ?? "",
    ctaLabel: b?.ctaLabel ?? "",
    link: b?.link ?? "",
    imageUrl: b?.imageUrl ?? "",
    imageAlt: b?.imageAlt ?? "",
    palette: b?.palette ?? "graphite",
    status: b?.status ?? "draft",
    startsAt: b?.startsAt ?? null,
    endsAt: b?.endsAt ?? null,
  };
};

const form = reactive<BlockInput>(start());

const device = ref<PreviewDevice>("desktop");

const dirty = computed(
  () => JSON.stringify(toRaw(form)) !== JSON.stringify(start()),
);

const { validate, resetForm } = useForm();

const revert = () => {
  Object.assign(form, start());
  uploadName.value = "";
  uploadError.value = "";
  localError.value = "";
  resetForm();
};

// A link is a storefront path or an https address.
const linkRule = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s) return "Enter where this block should link to.";
  return /^\/[^\s]*$/.test(s) || /^https:\/\/[^\s/]+\.[^\s]+$/.test(s)
    ? true
    : "Use a storefront path like /cameras-optics or a full https:// address.";
};

const imageRule = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s) return true;
  return /^https:\/\/\S+$/.test(s) || /^\/\S+$/.test(s)
    ? true
    : "Use an https:// address or a path like /img/banner.jpg.";
};

// --- Upload: read the picture in the browser and keep it with the block ---
const MAX_BYTES = 1_000_000;
const fileEl = ref<HTMLInputElement | null>(null);
const uploadName = ref("");
const uploadError = ref("");
const isUpload = computed(() => form.imageUrl.startsWith("data:"));

const onFile = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  uploadError.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    uploadError.value =
      "That file is not an image. Choose a PNG, JPG, WebP, AVIF or GIF.";
    return;
  }
  if (file.size > MAX_BYTES) {
    uploadError.value =
      "That image is over 1 MB. Compress it or use a smaller one.";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.imageUrl = String(reader.result);
    uploadName.value = file.name;
  };
  reader.onerror = () => {
    uploadError.value = "The image could not be read. Try another file.";
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  form.imageUrl = "";
  uploadName.value = "";
};

const scheduleNote = computed(() => {
  if (form.status === "draft")
    return "Draft: this block stays hidden from the storefront until you publish it.";
  return `Published: shown on the storefront ${windowLabel(form.startsAt, form.endsAt).replace(/^Always on$/, "all the time")}.`;
});

const localError = ref("");

const submit = async () => {
  localError.value = "";
  const { valid } = await validate();
  if (!valid) return;
  if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
    localError.value = "The expiry date must be on or after the go-live date.";
    return;
  }
  emit("save", {
    ...toRaw(form),
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    ctaLabel: form.ctaLabel.trim(),
    link: form.link.trim(),
    imageUrl: form.imageUrl.trim(),
    imageAlt: form.imageAlt.trim(),
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
  });
};

const shownError = computed(() => localError.value || props.error);
</script>