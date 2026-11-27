<template>
  <section id="media" class="scroll-mt-24 space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="media-title">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 id="media-title" class="flex items-center gap-2 font-display text-lg font-bold">
        <Icon name="lucide:image" size="18" class="text-accent" aria-hidden="true" />
        02 // {{ $t('products_ui.heading_images') }}
      </h2>
      <div class="shrink-0"><span class="chip">{{ $t('products_ui.assets_count', { count: form.media.length, max: MAX }) }}</span></div>
    </header>

    <ul
      v-if="form.media.length"
      class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <li
        v-for="(file, i) in form.media"
        :key="`${file.name}-${i}`"
        class="flex flex-col gap-2 rounded-card border bg-ink p-3"
        :class="i === 0 ? 'border-accent' : 'border-line'"
      >
        <img
          v-if="file.url"
          :src="file.url"
          :alt="file.name"
          loading="lazy"
          decoding="async"
          class="aspect-video w-full rounded-control border border-line bg-raised object-cover"
        />
        <span
          v-else
          class="grid aspect-video place-items-center rounded-control border border-line bg-raised text-mute"
          aria-hidden="true"
        >
          <Icon name="lucide:image" size="28" />
        </span>
        <div class="min-w-0">
          <p
            class="flex items-center gap-1.5 truncate font-mono text-xs"
            :title="file.name"
          >
            <LazyVStatusBadge v-if="i === 0" tone="accent"
              >{{ $t('products_ui.cover') }}</LazyVStatusBadge
            >
            <span class="truncate">{{ file.name }}</span>
          </p>
          <p class="meta">{{ formatSize(file.size) }}</p>
        </div>
        <div class="mt-auto flex items-center gap-1">
          <LazyVButton
            v-if="i > 0"
            variant="secondary"
            size="sm"
            @click="makeCover(i)"
            >{{ $t('products_ui.set_as_cover') }}</LazyVButton
          >

          <LazyVButton
            variant="icon"
            size="sm"
            icon="lucide:trash-2"
            :aria-label="$t('common_ui.remove_file', { name: file.name })"
            class="ms-auto hover:!border-accent hover:!text-accent"
            @click="remove(i)"
          />
        </div>
      </li>
    </ul>

    <LazyVFileUpload
      multiple
      :max-files="MAX"
      :max-size-mb="25"
      :accept="['.png', '.jpg', '.jpeg', '.webp']"
      :title="$t('products_ui.upload_title')"
      :description="$t('products_ui.upload_desc')"
      :button-label="$t('products_ui.select_local_files')"
      @select="add"
      @reject="
        (message) => toast.warning(t('products_ui.file_not_added'), { description: message })
      "
    />
    <p class="callout mt-3">
      <Icon
        name="lucide:info"
        size="14"
        class="bullet-icon"
        aria-hidden="true"
      />
      <span>{{ $t('products_ui.resize_note') }}</span>
    </p>
  </section>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

const { t } = useI18n();
const MAX = 12;
const toast = useToast();

const formatSize = (b: number) =>
  b >= 1e6
    ? t("products_ui.size_mb", { size: (b / 1e6).toFixed(1) })
    : t("products_ui.size_kb", { size: Math.max(1, Math.round(b / 1e3)) });

const add = async (files: File[]) => {
  const room = MAX - props.form.media.length;
  if (files.length > room)
    toast.warning(t("products_ui.media_full_title"), {
      description: t(room === 1 ? "products_ui.media_full_one" : "products_ui.media_full_other", { count: room }),
    });
  for (const f of files.slice(0, Math.max(0, room))) {
    try {
      const { url, bytes } = await toWebImage(f);
      props.form.media.push({ name: f.name, size: bytes, url });
    } catch {
      toast.warning(t("products_ui.file_not_added"), {
        description: t("products_ui.image_read_error", { name: f.name }),
      });
    }
  }
};

const remove = (i: number) => props.form.media.splice(i, 1);

const makeCover = (i: number) => {
  const [file] = props.form.media.splice(i, 1);
  if (file) props.form.media.unshift(file);
};
</script>