<template>
  <div :class="inline ? 'flex items-center gap-2' : 'space-y-1.5'" v-bind="wrapperAttrs()">
    <label v-if="label" :for="inputId" class="block" :class="[labelClass ?? 'text-sm font-medium', hideLabel && 'sr-only']">
      {{ label }}
      <span v-if="required" class="text-accent" aria-hidden="true">*</span>
      <span v-else-if="optional" class="font-normal text-mute">(optional)</span>
    </label>

    <div :class="(icon || revealable) && 'relative'">
      <Icon v-if="icon" :name="icon" size="16" class="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden="true" />
      <input
        v-bind="controlAttrs()"
        :id="inputId"
        ref="el"
        :type="inputType"
        :name="fieldName"
        :value="display"
        :class="controlClass"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-required="required || undefined"
        @input="onInput"
        @change="onChange"
        @blur="onBlur"
      />
      <VButton
        v-if="revealable && type === 'password'"
        variant="plain"
        class="absolute end-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-control text-mute transition-colors duration-200 hover:text-paper"
        :aria-label="shown ? 'Hide password' : 'Show password'"
        :aria-pressed="shown"
        @click="shown = !shown"
      >
        <Icon :name="shown ? 'lucide:eye-off' : 'lucide:eye'" size="16" aria-hidden="true" />
      </VButton>
    </div>

    <p v-if="hint && !errorMessage" :id="`${inputId}-hint`" class="text-xs text-mute">{{ hint }}</p>
    <p v-if="errorMessage" :id="`${inputId}-error`" class="flex items-start gap-1.5 text-xs text-accent" role="alert">
      <Icon name="lucide:circle-alert" size="14" class="mt-px shrink-0" aria-hidden="true" />{{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
/**
 * Text-like inputs. Checkboxes live in <LazyVCheckboxImput>, radios in <LazyVRadioInput>, selects live in <LazyVSelectInput> and
 * multi-line text in <LazyVTextarea>; all three share the same vee-validate wiring.
 *
 *   <LazyVInput v-model="email" name="email" label="Email" type="email" required rules="required|email" />
 *
 * - Works on its own, and inside a `useForm()` (it registers by `name`).
 * - Validates on blur, then re-checks while typing once an error is showing.
 * - `class` styles the wrapper; `inputClass` styles the control. Native attrs
 *   (autocomplete, placeholder, min, max, @keydown…) go to the control.
 */
defineOptions({ inheritAttrs: false });

type FieldType =
  | "text" | "email" | "tel" | "password" | "search" | "number" | "url" | "range";

const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    name?: string;
    label?: string;
    /** Keep the label for screen readers only. */
    hideLabel?: boolean;
    type?: FieldType;
    /** vee-validate rules: "required|email", an object, or a function. */
    rules?: unknown;
    hint?: string;
    /** Shows the asterisk. */
    required?: boolean;
    /** Shows "(optional)". */
    optional?: boolean;
    /** Commit on change (blur / Enter) instead of on every keystroke. */
    lazy?: boolean;
    /** Password fields: adds a show / hide button. */
    revealable?: boolean;
    /** Leading icon inside the field. */
    icon?: string;
    /** "field" is the standard look, "bare" brings no styling of its own. */
    variant?: "field" | "bare";
    inputClass?: unknown;
    /** Replaces the default label look (`text-sm font-medium`). */
    labelClass?: unknown;
    /** Label and control on one row. */
    inline?: boolean;
    /** Reformat what is typed, e.g. card numbers. */
    format?: (v: string) => string;
  }>(),
  { type: "text", variant: "field" },
);

const emit = defineEmits<{ "update:modelValue": [value: unknown] }>();

const {
  el, fieldName, inputId, value, errorMessage, validate, describedBy, controlAttrs, wrapperAttrs, commit, recheck, onBlur,
} = useFormField(props, (v) => emit("update:modelValue", v));

const shown = ref(false);
const inputType = computed(() => (props.revealable && props.type === "password" && shown.value ? "text" : props.type));

const display = computed(() => (value.value ?? "") as string | number);

const controlClass = computed(() => [
  props.variant === "field" && ["field", props.icon && "!ps-10", props.revealable && "!pe-11", errorMessage.value && "!border-accent"],
  props.inputClass,
]);

const parse = (raw: string): unknown => {
  if (props.type === "number" || props.type === "range") {
    const n = raw === "" ? null : Number(raw);
    return n === null || Number.isNaN(n) ? null : n;
  }
  return props.format ? props.format(raw) : raw;
};

const onInput = (e: Event) => {
  if (props.lazy) return;
  const node = e.target as HTMLInputElement;
  const v = parse(node.value);
  if (props.format && typeof v === "string") node.value = v;
  commit(v);
  recheck();
};

const onChange = (e: Event) => {
  if (!props.lazy) return;
  commit(parse((e.target as HTMLInputElement).value));
  recheck();
};

defineExpose({
  focus: () => (el.value as HTMLElement | undefined)?.focus(),
  blur: () => (el.value as HTMLElement | undefined)?.blur(),
  el,
  validate,
});
</script>
