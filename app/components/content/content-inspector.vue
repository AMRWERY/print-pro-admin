<template>
  <LazyVPanel
    :title="block ? $t('content_ui.insp_slot_title') : $t('content_ui.insp_new_title')"
    :subtitle="
      block
        ? $t('content_ui.insp_live_preview', { slot: kindMeta[form.kind].slot })
        : $t('content_ui.insp_new_subtitle')
    "
    :icon="block ? 'lucide:panels-top-left' : 'lucide:circle-plus'"
  >
    <template #actions>
      <LazyVButton
        variant="icon"
        size="sm"
        icon="lucide:x"
        :aria-label="$t('common_ui.close')"
        data-close-btn
        @click="emit('close')"
      />
    </template>

    <!-- Responsive preview: follows the form as you type -->
    <section class="space-y-3" aria-labelledby="cb-preview">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h3 id="cb-preview" class="label-caps">
          {{ $t('content_ui.insp_responsive_preview') }}
        </h3>

        <LazyVSegmented
          v-model="device"
          :label="$t('content_ui.preview_label')"
          :options="deviceOptions"
        />
      </div>
      <div class="rounded-card bg-ink p-3">
        <content-preview
          :block="form"
          :device="device"
          :caption="
            $t('content_ui.insp_preview_caption', {
              device: deviceMeta[device].label,
              title: form.title,
            })
          "
        />
      </div>
      <p class="meta text-center font-mono">
        {{
          $t('content_ui.insp_device_width', {
            device: deviceMeta[device].label,
            px: deviceMeta[device].px,
          })
        }}
      </p>
    </section>

    <form
      id="content-form"
      class="mt-5 space-y-5"
      novalidate
      @submit.prevent="submit"
    >
      <section class="space-y-3" aria-labelledby="cb-copy">
        <h3 id="cb-copy" class="label-caps">
          {{ $t('content_ui.insp_sec_copy') }}
        </h3>

        <LazyVSelectInput
          v-model="form.kind"
          name="cbKind"
          :label="$t('content_ui.content_type')"
          :options="kindOptions"
          :hint="kindMeta[form.kind].hint"
        />

        <LazyVInput
          v-model="form.title"
          name="cbTitle"
          :label="$t('content_ui.insp_headline')"
          required
          rules="required|min:2|max:120"
          maxlength="120"
        />

        <LazyVTextarea
          v-model="form.subtitle"
          name="cbSubtitle"
          :label="$t('content_ui.insp_supporting')"
          optional
          rows="3"
          maxlength="240"
        />
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVInput
            v-model="form.ctaLabel"
            name="cbCta"
            :label="$t('content_ui.insp_button_label')"
            optional
            maxlength="30"
          />

          <LazyVInput
            v-model="form.link"
            name="cbLink"
            :label="$t('content_ui.preview_links_to')"
            required
            :rules="linkRule"
            maxlength="200"
            :placeholder="$t('content_ui.insp_link_placeholder')"
            input-class="font-mono"
            dir="ltr"
          />
        </div>
      </section>

      <section class="space-y-3" aria-labelledby="cb-media">
        <h3 id="cb-media" class="label-caps">
          {{ $t('content_ui.insp_sec_media') }}
        </h3>

        <div
          v-if="isUpload"
          class="flex items-center gap-3 rounded-control border border-line bg-ink px-3 py-2"
        >
          <Icon name="lucide:image" size="16" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-sm">{{
            uploadName || $t('content_ui.insp_uploaded_image')
          }}</span>

          <LazyVButton
            variant="tertiary"
            size="sm"
            icon="lucide:trash-2"
            @click="clearImage"
            >{{ $t('common_ui.remove') }}</LazyVButton
          >
        </div>

        <LazyVInput
          v-else
          v-model="form.imageUrl"
          name="cbImage"
          :label="$t('content_ui.insp_image_address')"
          optional
          :rules="imageRule"
          :placeholder="$t('content_ui.insp_image_placeholder')"
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
            :aria-label="$t('content_ui.insp_upload_aria')"
            @change="onFile"
          />

          <LazyVButton
            variant="secondary"
            size="sm"
            icon="lucide:upload"
            @click="fileEl?.click()"
            >{{ $t('common_ui.upload_image') }}</LazyVButton
          >

          <span class="meta"
            >{{ $t('content_ui.insp_upload_note', { size: '1 MB' }) }}</span
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
          :label="$t('content_ui.insp_alt_label')"
          optional
          maxlength="160"
          :hint="$t('content_ui.insp_alt_hint')"
        />

        <fieldset>
          <legend class="label">{{ $t('content_ui.insp_artwork_colour') }}</legend>
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
          {{ $t('content_ui.insp_sec_schedule') }}
        </h3>
        <div class="grid gap-3 sm:grid-cols-2">
          <LazyVDatePicker
            v-model="form.startsAt"
            name="cbStart"
            :label="$t('content_ui.insp_goes_live')"
            optional
            clearable
            :shortcuts="false"
            :placeholder="$t('content_ui.insp_immediately')"
          />

          <LazyVDatePicker
            v-model="form.endsAt"
            name="cbEnd"
            :label="$t('content_ui.insp_expires')"
            optional
            clearable
            :shortcuts="false"
            :placeholder="$t('content_ui.insp_never_expires')"
            :min="form.startsAt || undefined"
          />
        </div>

        <LazyVSelectInput
          v-model="form.status"
          name="cbStatus"
          :label="$t('common_ui.status')"
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
        >{{ $t('content_ui.insp_delete_block') }}</LazyVButton
      >

      <span v-else />

      <div class="flex flex-wrap items-center gap-2">
        <LazyVButton
          v-if="dirty"
          variant="tertiary"
          icon="lucide:undo-2"
          :disabled="saving"
          @click="revert"
          >{{ $t('content_ui.insp_revert') }}</LazyVButton
        >

        <LazyVButton
          type="submit"
          form="content-form"
          :loading="saving"
          icon="lucide:save"
          >{{ block ? $t("btn.save_changes") : $t("content_ui.insp_create_block") }}</LazyVButton
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

const { t } = useI18n();

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
  if (!s) return t("content_ui.rule_link_required");
  return /^\/[^\s]*$/.test(s) || /^https:\/\/[^\s/]+\.[^\s]+$/.test(s)
    ? true
    : t("content_ui.rule_link_invalid");
};

const imageRule = (v: unknown) => {
  const s = String(v ?? "").trim();
  if (!s) return true;
  return /^https:\/\/\S+$/.test(s) || /^\/\S+$/.test(s)
    ? true
    : t("content_ui.rule_image_invalid");
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
    uploadError.value = t("content_ui.upload_not_image");
    return;
  }
  if (file.size > MAX_BYTES) {
    uploadError.value = t("content_ui.upload_too_big", { size: "1 MB" });
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    form.imageUrl = String(reader.result);
    uploadName.value = file.name;
  };
  reader.onerror = () => {
    uploadError.value = t("content_ui.upload_read_error");
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  form.imageUrl = "";
  uploadName.value = "";
};

const scheduleNote = computed(() => {
  if (form.status === "draft")
    return t("content_ui.schedule_note_draft");
  return t("content_ui.schedule_note_published", {
    window: windowLabel(form.startsAt, form.endsAt).replace(
      /^Always on$/,
      t("content_ui.schedule_all_time"),
    ),
  });
});

const localError = ref("");

const submit = async () => {
  localError.value = "";
  const { valid } = await validate();
  if (!valid) return;
  if (form.startsAt && form.endsAt && form.endsAt < form.startsAt) {
    localError.value = t("content_ui.err_expiry_before");
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