<template>
  <div>
    <label :for="inputId" class="label">{{ label }}</label>
    <div
      class="field flex min-h-11 flex-wrap items-center gap-1.5 !py-1.5 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/60"
      @click="focusInput"
    >
      <span
        v-for="(item, i) in items"
        :key="`${item}-${i}`"
        class="inline-flex items-center gap-1 rounded-tight border border-line bg-raised px-1.5 py-0.5 font-mono text-xs"
      >
        {{ item }}
        <button
          type="button"
          class="rounded-tight text-mute transition duration-fast hover:text-accent"
          :aria-label="`Remove ${item}`"
          @click.stop="remove(i)"
        >
          <Icon name="lucide:x" size="12" aria-hidden="true" />
        </button>
      </span>
      <input
        :id="inputId"
        ref="input"
        v-model="draft"
        type="text"
        class="min-w-24 flex-1 border-0 bg-transparent p-0 text-sm text-paper placeholder:text-mute focus:ring-0"
        :placeholder="items.length ? '' : placeholder"
        :disabled="atLimit"
        :aria-describedby="hintId"
        @keydown.enter.prevent="commit"
        @keydown.188.prevent="commit"
        @keydown.backspace="onBackspace"
        @blur="commit"
      />
    </div>
    <p :id="hintId" class="mt-1 text-xs text-mute">
      {{ atLimit ? `Up to ${max} items.` : hint || "Press Enter to add." }}
    </p>
  </div>
</template>

<script lang="ts" setup>
/**
 * Free-form list of short values shown as removable chips: type, press Enter (or comma)
 * to add; Backspace on an empty field removes the last one.
 *
 *   <LazyVChipsInput v-model="tags" label="Product tags" placeholder="#tag" :max="15" />
 */

const props = defineProps<{
  label: string;
  placeholder?: string;
  hint?: string;
  max?: number;
}>();

const items = defineModel<string[]>({ default: () => [] });

const inputId = useId();
const hintId = useId();
const input = ref<HTMLInputElement | null>(null);
const draft = ref("");

const atLimit = computed(() => !!props.max && items.value.length >= props.max);

const commit = () => {
  const value = draft.value.trim().replace(/,$/, "");
  draft.value = "";
  if (!value || atLimit.value || items.value.includes(value)) return;
  items.value = [...items.value, value];
};

const remove = (i: number) => {
  items.value = items.value.filter((_, ix) => ix !== i);
  input.value?.focus();
};

const onBackspace = () => {
  if (!draft.value && items.value.length)
    items.value = items.value.slice(0, -1);
};

const focusInput = () => input.value?.focus();
</script>