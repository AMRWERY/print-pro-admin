<template>
  <div class="space-y-1.5" v-bind="wrapperAttrs()">
    <label
      :for="inputId"
      class="group flex items-start gap-2.5 text-sm"
      :class="[
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        boxed &&
          'rounded-card border border-line bg-surface p-3 transition-colors duration-200 hover:border-mute/60 has-[:checked]:border-accent has-[:checked]:bg-accent-soft',
        boxed && errorMessage && '!border-accent',
        labelClass,
      ]"
    >
      <!-- Native input stays in the DOM (keyboard, forms, screen readers); the box is drawn beside it. -->
      <span
        class="relative mt-0.5 grid shrink-0 place-items-center"
        :class="sizeClass"
      >
        <input
          v-bind="controlAttrs()"
          :id="inputId"
          ref="el"
          type="checkbox"
          :name="fieldName"
          :checked="checked"
          :disabled="disabled"
          :indeterminate.prop="indeterminate"
          class="cb-input peer absolute inset-0 z-10 m-0 h-full w-full cursor-[inherit] opacity-0"
          :aria-invalid="errorMessage ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-required="required || undefined"
          @change="onChange"
          @blur="onBlur"
        />
        <span
          class="cb-box pointer-events-none grid h-full w-full place-items-center rounded-tight border bg-surface transition duration-200"
          :class="[
            tone === 'success' ? 'cb-success' : 'cb-accent',
            errorMessage ? 'border-accent' : 'border-line',
            !disabled && 'group-hover:border-mute',
          ]"
          aria-hidden="true"
        >
          <svg
            class="h-[70%] w-[70%]"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path class="cb-tick" d="M2.5 6.5 5 9l4.5-5.5" pathLength="1" />
            <path class="cb-dash" d="M3 6h6" pathLength="1" />
          </svg>
        </span>
      </span>

      <span
        v-if="label || description || $slots.default"
        class="min-w-0 flex-1"
        :class="hideLabel && 'sr-only'"
      >
        <span class="block"
          ><slot>{{ label }}</slot
          ><span v-if="required" class="text-accent" aria-hidden="true">
            *</span
          ></span
        >
        <span v-if="description" class="mt-0.5 block text-xs text-mute">{{
          description
        }}</span>
      </span>
    </label>

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
 * The one checkbox for the whole project: a drawn box with an animated tick (and a dash
 * for "some selected"), on top of a real <input type="checkbox">. Same vee-validate
 * behaviour as <LazyVInput>.
 *
 *   <LazyVCheckboxImput v-model="remember">Remember this device</LazyVCheckboxImput>
 *   <LazyVCheckboxImput v-model="terms" name="terms" :rules="mustAccept('…')">I agree…</LazyVCheckboxImput>
 *   <LazyVCheckboxImput v-model="picked" value="canon" label="Canon" />        array of values
 *   <LazyVCheckboxImput :model-value="all" :indeterminate="some && !all" label="Select all" />
 *   <LazyVCheckboxImput v-model="gift" boxed label="Gift wrap" description="Adds $5" />
 *
 * - `v-model`: boolean, or an array when `value` is given (the value is toggled in the array).
 * - `boxed` turns the whole row into a card that highlights when checked.
 * - `size`: sm | md (default) | lg. `tone`: accent (default) | success.
 * - `class` styles the wrapper, `labelClass` the label row. Native attrs go to the input.
 */

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    name?: string;
    label?: string;
    /** Secondary line under the label. */
    description?: string;
    /** Keep the label for screen readers only. */
    hideLabel?: boolean;
    /** What this box stands for when `v-model` is an array. */
    value?: unknown;
    rules?: unknown;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    /** "Some selected" state; shown as a dash until the user toggles. */
    indeterminate?: boolean;
    /** The whole row becomes a card that highlights when checked. */
    boxed?: boolean;
    size?: "sm" | "md" | "lg";
    tone?: "accent" | "success";
    /** Extra classes on the label row (e.g. "items-center"). */
    labelClass?: unknown;
  }>(),
  { size: "md", tone: "accent" },
);

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
} = useFormField(props as never, (v) => emit("update:modelValue", v));

const checked = computed(() =>
  Array.isArray(value.value)
    ? value.value.includes(props.value)
    : !!value.value,
);

const sizeClass = computed(
  () => ({ sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" })[props.size],
);

const onChange = (e: Event) => {
  const on = (e.target as HTMLInputElement).checked;
  if (Array.isArray(props.modelValue)) {
    const list = props.modelValue as unknown[];
    commit(
      on
        ? [...list, props.value]
        : list.filter((x) => !Object.is(x, props.value)),
      { syncDom: false },
    );
  } else commit(on, { syncDom: false });
  recheck();
};

defineExpose({
  focus: () => (el.value as HTMLElement | undefined)?.focus(),
  el,
  validate,
});
</script>

<style scoped>
.cb-box {
  --cb: var(--c-accent);
  --cb-on: var(--c-onaccent);
  color: rgb(var(--cb-on));
}

.cb-success {
  --cb: var(--c-success);
  --cb-on: var(--c-onprimary);
}

/* Tick draws itself; the dash scales in. Transform/opacity-friendly, ≤200ms. */
.cb-tick,
.cb-dash {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.2s ease-out;
}

.cb-input:checked + .cb-box,
.cb-input:indeterminate + .cb-box {
  background-color: rgb(var(--cb));
  border-color: rgb(var(--cb));
}

.cb-input:checked + .cb-box {
  animation: cb-pop 0.2s ease-out;
}

.cb-input:checked + .cb-box .cb-tick,
.cb-input:indeterminate + .cb-box .cb-dash {
  stroke-dashoffset: 0;
}

.cb-input:indeterminate + .cb-box .cb-tick {
  stroke-dashoffset: 1;
}

/* The input is invisible, so the ring shows on the box instead. */
.cb-input:focus-visible {
  box-shadow: none;
  outline: none;
}

.cb-input:focus-visible + .cb-box {
  box-shadow:
    0 0 0 2px rgb(var(--c-ink)),
    0 0 0 4px rgb(var(--c-cyan));
}

.cb-input:active:not(:disabled) + .cb-box {
  transform: scale(0.9);
}

@keyframes cb-pop {
  50% {
    transform: scale(1.12);
  }
}
</style>