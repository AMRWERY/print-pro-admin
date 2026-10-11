<template>
  <div class="space-y-1.5" v-bind="wrapperAttrs()">
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

    <textarea
      v-bind="controlAttrs()"
      :id="inputId"
      ref="el"
      :name="fieldName"
      :value="(value ?? '') as string"
      :class="['field', errorMessage && '!border-accent', inputClass]"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="required || undefined"
      @input="onInput"
      @blur="onBlur"
    />

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
 * Multi-line text, with the same vee-validate behaviour as <LazyVInput>.
 *
 *   <LazyVTextarea v-model="notes" name="notes" label="Delivery notes" optional rows="3" maxlength="300" />
 */

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: unknown;
  name?: string;
  label?: string;
  hideLabel?: boolean;
  rules?: unknown;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  inputClass?: unknown;
  /** Replaces the default label look (`text-sm font-medium`). */
  labelClass?: unknown;
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

const onInput = (e: Event) => {
  commit((e.target as HTMLTextAreaElement).value);
  recheck();
};

defineExpose({
  focus: () => (el.value as HTMLElement | undefined)?.focus(),
  blur: () => (el.value as HTMLElement | undefined)?.blur(),
  el,
  validate,
});
</script>