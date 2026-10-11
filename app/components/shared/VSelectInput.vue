<template>
  <div :class="inline ? 'flex items-center gap-2' : 'space-y-1.5'" v-bind="wrapperAttrs()">
    <label
      v-if="label"
      :for="inputId"
      class="block"
      :class="[labelClass ?? 'text-sm font-medium', hideLabel && 'sr-only']"
    >
      {{ label }}
      <span v-if="required" class="text-accent" aria-hidden="true">*</span>
      <span v-else-if="optional" class="font-normal text-mute">(optional)</span>
    </label>

    <select
      v-bind="controlAttrs()"
      :id="inputId"
      ref="el"
      :name="fieldName"
      :value="value ?? ''"
      :class="['field', errorMessage && '!border-accent', inputClass]"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="required || undefined"
      @change="onChange"
      @blur="onBlur"
    >
      <template v-if="options">
        <option v-for="o in options" :key="String(o.value)" :value="o.value">
          {{ o.label }}
        </option>
      </template>
      <slot v-else />
    </select>

    <p
      v-if="hint && !errorMessage"
      :id="`${inputId}-hint`"
      class="text-xs text-mute"
    >
      {{ hint }}
    </p>
    <p
      v-if="errorMessage"
      :id="`${inputId}-error`"
      class="flex items-start gap-1.5 text-xs text-accent"
      role="alert"
    >
      <Icon
        name="lucide:circle-alert"
        size="14"
        class="mt-px shrink-0"
        aria-hidden="true"
      />{{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
/**
 * A select, with the same vee-validate behaviour as <LazyVInput>.
 *
 *   <LazyVSelectInput v-model="country" name="country" label="Country" required
 *                     rules="required" :options="[{ value: 'US', label: 'United States' }]" />
 *
 * Pass `options`, or put <option> elements in the default slot.
 */

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: unknown;
  name?: string;
  label?: string;
  hideLabel?: boolean;
  options?: { value: string | number; label: string }[];
  rules?: unknown;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  inputClass?: unknown;
  /** Replaces the default label look (`text-sm font-medium`). */
  labelClass?: unknown;
  /** Label and select on one row, e.g. "Sort [select]". */
  inline?: boolean;
}>();

const emit = defineEmits<{ "update:modelValue": [value: unknown] }>();

const {
  el,
  fieldName,
  inputId,
  value,
  errorMessage,
  validate,
  describedBy,
  controlAttrs,
  wrapperAttrs,
  commit,
  recheck,
  onBlur,
} = useFormField(props, (v) => emit("update:modelValue", v));

const onChange = (e: Event) => {
  const node = e.target as HTMLSelectElement;
  // Hand back the option's own value (a number stays a number), not the DOM string.
  const match = props.options?.find((o) => String(o.value) === node.value);
  commit(match ? match.value : node.value);
  recheck();
};

defineExpose({
  focus: () => (el.value as HTMLElement | undefined)?.focus(),
  blur: () => (el.value as HTMLElement | undefined)?.blur(),
  el,
  validate,
});
</script>