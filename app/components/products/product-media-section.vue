<template>
  <LazyVPanel
    id="media"
    title="02 // Images"
    icon="lucide:image"
    class="scroll-mt-24"
  >
    <template #actions>
      <span class="chip">{{ form.media.length }} / {{ MAX }} assets</span>
    </template>

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
        <span
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
              >Cover</LazyVStatusBadge
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
            >Set as cover</LazyVButton
          >

          <LazyVButton
            variant="icon"
            size="sm"
            icon="lucide:trash-2"
            :aria-label="`Remove ${file.name}`"
            class="ms-auto hover:!border-accent hover:!text-accent"
            @click="remove(i)"
          />
        </div>
      </li>
    </ul>

    <LazyVFileUpload
      multiple
      :max-files="MAX"
      :max-size-mb="200"
      :accept="['.png', '.jpg', '.jpeg', '.webp']"
      title="Drag and drop product images (JPG, PNG or WebP)"
      description="The first image is the cover."
      button-label="Select local files"
      @select="add"
      @reject="
        (message) => toast.warning('File not added', { description: message })
      "
    />
    <p class="callout mt-3">
      <Icon
        name="lucide:info"
        size="14"
        class="bullet-icon"
        aria-hidden="true"
      />
      <span
        >This demo records each file's name and size only. The image data itself
        isn't stored.</span
      >
    </p>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

const MAX = 12;
const toast = useToast();

const formatSize = (b: number) =>
  b >= 1e6
    ? `${(b / 1e6).toFixed(1)} MB`
    : `${Math.max(1, Math.round(b / 1e3))} KB`;

const add = (files: File[]) => {
  const room = MAX - props.form.media.length;
  if (files.length > room)
    toast.warning("Media reel is full", {
      description: `Only ${room} more file${room === 1 ? "" : "s"} fit.`,
    });
  props.form.media.push(
    ...files
      .slice(0, Math.max(0, room))
      .map((f) => ({ name: f.name, size: f.size })),
  );
};

const remove = (i: number) => props.form.media.splice(i, 1);

const makeCover = (i: number) => {
  const [file] = props.form.media.splice(i, 1);
  if (file) props.form.media.unshift(file);
};
</script>