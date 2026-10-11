<template>
  <div class="space-y-3">
    <div
      :aria-busy="loading || undefined"
      class="group rounded-card border-2 border-dashed p-6 text-center transition-colors duration-200 sm:p-10"
      :class="[
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        over
          ? 'border-accent bg-accent-soft'
          : 'border-line bg-ink/40 hover:border-mute/60',
        error && !over && '!border-accent/60',
      ]"
      @click="!disabled && open()"
      @dragenter.prevent="onEnter"
      @dragover.prevent
      @dragleave.prevent="onLeave"
      @drop.prevent="onDrop"
    >
      <span
        class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-raised text-accent transition-transform duration-200"
        :class="over && '-translate-y-1 scale-110'"
        aria-hidden="true"
      >
        <Icon
          :name="
            loading ? 'lucide:loader-circle' : over ? 'lucide:download' : icon
          "
          size="24"
          :class="loading && 'animate-spin motion-reduce:animate-none'"
        />
      </span>

      <p class="mt-4 font-display text-lg font-semibold text-paper">
        {{ over ? dropTitle : title }}
      </p>
      <p v-if="description" class="mx-auto mt-1 max-w-xl text-sm text-mute">
        {{ description }}
      </p>

      <LazyVButton
        class="mt-5"
        variant="secondary"
        icon="lucide:folder-open"
        :disabled="disabled"
        :loading="loading"
        @click.stop="open()"
        >{{ buttonLabel }}</LazyVButton
      >

      <p v-if="limits" class="mt-3 font-mono text-1xs tracking-wider text-mute">
        {{ limits }}
      </p>
      <p v-if="hint" class="mt-2 text-1xs text-mute">{{ hint }}</p>
    </div>

    <p v-if="shownError" role="alert" class="callout-accent !text-accent">
      <Icon
        name="lucide:circle-alert"
        size="16"
        class="mt-0.5 shrink-0"
        aria-hidden="true"
      />{{ shownError }}
    </p>

    <!-- Optional list of the files picked so far (multiple / controlled use) -->
    <TransitionGroup
      v-if="list && modelValue?.length"
      tag="ul"
      name="file"
      class="space-y-2"
      aria-label="Selected files"
    >
      <li
        v-for="(f, i) in modelValue"
        :key="`${f.name}-${f.size}-${f.lastModified}`"
        class="flex items-center gap-3 rounded-card border border-line bg-surface p-2.5"
      >
        <span
          class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-control border border-line bg-raised text-mute"
        >
          <img
            v-if="previews[i]"
            :src="previews[i]"
            :alt="`Thumbnail of ${f.name}`"
            class="h-full w-full object-cover"
          />
          <Icon v-else name="lucide:file" size="18" aria-hidden="true" />
        </span>
        <span class="min-w-0 flex-1">
          <span
            class="block truncate font-mono text-xs font-semibold text-paper"
            >{{ f.name }}</span
          >
          <span class="meta">{{ formatSize(f.size) }}</span>
        </span>
        <LazyVButton
          variant="icon"
          size="sm"
          :aria-label="`Remove ${f.name}`"
          icon="lucide:x"
          @click="remove(i)"
        />
      </li>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
/**
 * Drag-and-drop file picker. It only handles *getting* files (drop, click, keyboard),
 * checks type and size, and tells you what arrived; what you do with them is up to you.
 *
 *   <LazyVFileUpload
 *     title="Drag your artwork here"
 *     description="TIFF, PSD or PDF."
 *     :accept="['.tif', '.tiff', '.pdf']"
 *     :max-size-mb="500"
 *     :loading="checking"
 *     :error="fileError"
 *     @select="(files) => setFile(files[0])"
 *   />
 *
 *   <LazyVFileUpload v-model="photos" multiple list :max-files="5" accept="image/*" />
 *
 * - `accept`: extensions (".pdf"), MIME types ("image/png") or wildcards ("image/*"), as an
 *   array or comma list. Also filters the browser's file dialog.
 * - `@select` fires with the valid files; `@reject` with a message when something is refused.
 * - With `v-model` + `list`, picked files are listed with thumbnails and a remove button.
 * - Keyboard: Tab to the "Select" button and press Enter; clicking anywhere in the zone also opens the dialog.
 */

const props = withDefaults(
  defineProps<{
    /** Controlled list of picked files (use with `list`). */
    modelValue?: File[];
    accept?: string | string[];
    multiple?: boolean;
    maxSizeMb?: number;
    /** Most files kept when `multiple`. */
    maxFiles?: number;
    title?: string;
    /** Headline while a file is dragged over the zone. */
    dropTitle?: string;
    description?: string;
    /** Small print under the button. */
    hint?: string;
    buttonLabel?: string;
    icon?: string;
    /** Show the list of picked files under the zone. */
    list?: boolean;
    /** Spinner + blocked while you process the file. */
    loading?: boolean;
    disabled?: boolean;
    /** An error from outside (e.g. your own validation) shown in the same place. */
    error?: string;
  }>(),
  {
    title: "Drag files here",
    dropTitle: "Drop to upload",
    buttonLabel: "Select local file",
    icon: "lucide:cloud-upload",
  },
);

const emit = defineEmits<{
  "update:modelValue": [files: File[]];
  select: [files: File[]];
  reject: [message: string];
}>();

const acceptList = computed(() =>
  (Array.isArray(props.accept) ? props.accept : (props.accept ?? "").split(","))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

const limits = computed(() => {
  const parts: string[] = [];
  const exts = acceptList.value.filter((a) => a.startsWith("."));
  if (exts.length)
    parts.push(exts.map((e) => e.slice(1).toUpperCase()).join(" · "));
  if (props.maxSizeMb) parts.push(`MAX ${props.maxSizeMb} MB`);
  if (props.multiple && props.maxFiles)
    parts.push(`UP TO ${props.maxFiles} FILES`);
  return parts.join("  /  ");
});

const formatSize = (b: number) =>
  b >= 1e6
    ? `${(b / 1e6).toFixed(1)} MB`
    : `${Math.max(1, Math.round(b / 1e3))} KB`;

const accepted = (f: File) => {
  if (!acceptList.value.length) return true;
  const name = f.name.toLowerCase();
  const type = f.type.toLowerCase();
  return acceptList.value.some((a) =>
    a.startsWith(".")
      ? name.endsWith(a)
      : a.endsWith("/*")
        ? type.startsWith(a.slice(0, -1))
        : type === a,
  );
};

// ---------- intake ----------
const localError = ref("");
const shownError = computed(() => localError.value || props.error);

const handle = (incoming: File[]) => {
  if (props.disabled || props.loading || !incoming.length) return;
  localError.value = "";
  const problems: string[] = [];
  let valid: File[] = [];

  for (const f of incoming) {
    if (!accepted(f)) problems.push(`“${f.name}” isn’t a supported file type.`);
    else if (props.maxSizeMb && f.size > props.maxSizeMb * 1e6)
      problems.push(
        `“${f.name}” is ${formatSize(f.size)}. The limit is ${props.maxSizeMb} MB.`,
      );
    else valid.push(f);
  }

  if (!props.multiple && valid.length > 1) {
    problems.push("Only one file can be uploaded at a time; using the first.");
    valid = valid.slice(0, 1);
  }
  if (props.multiple && props.maxFiles) {
    const room = props.maxFiles - (props.modelValue?.length ?? 0);
    if (valid.length > room) {
      problems.push(`You can add up to ${props.maxFiles} files.`);
      valid = valid.slice(0, Math.max(0, room));
    }
  }

  if (problems.length) {
    localError.value = problems.join(" ");
    emit("reject", localError.value);
  }
  if (!valid.length) return;
  if (props.list || props.modelValue)
    emit(
      "update:modelValue",
      props.multiple ? [...(props.modelValue ?? []), ...valid] : valid,
    );
  emit("select", valid);
};

const { open, onChange } = useFileDialog({
  accept: computed(() => acceptList.value.join(",")).value,
  multiple: props.multiple,
  reset: true,
});

onChange((files) => files && handle([...files]));

// A counter keeps the highlight steady while the pointer crosses child elements.
const over = ref(false);

let depth = 0;

const onEnter = () => {
  if (props.disabled) return;
  depth++;
  over.value = true;
};

const onLeave = () => {
  depth = Math.max(0, depth - 1);
  if (!depth) over.value = false;
};

const onDrop = (e: DragEvent) => {
  depth = 0;
  over.value = false;
  handle([...(e.dataTransfer?.files ?? [])]);
};

defineExpose({ open: () => open() });

const remove = (i: number) => {
  localError.value = "";
  emit(
    "update:modelValue",
    (props.modelValue ?? []).filter((_, n) => n !== i),
  );
};

// Thumbnails for image files; revoked when the list changes or the component goes away.
const previews = ref<(string | undefined)[]>([]);

watch(
  () => props.modelValue,
  (files) => {
    previews.value.forEach((u) => u && URL.revokeObjectURL(u));
    previews.value = (files ?? []).map((f) =>
      f.type.startsWith("image/") && f.size < 30e6
        ? URL.createObjectURL(f)
        : undefined,
    );
  },
  { immediate: true },
);

onBeforeUnmount(() =>
  previews.value.forEach((u) => u && URL.revokeObjectURL(u)),
);
</script>

<style scoped>
.file-enter-active,
.file-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.file-enter-from,
.file-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>