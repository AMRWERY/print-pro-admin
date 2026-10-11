<template>
  <div class="space-y-1.5" v-bind="wrapperAttrs()">
    <label
      :for="inputId"
      class="group flex items-start gap-2.5 text-sm"
      :class="[
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        boxed && (dense ? 'p-3' : 'p-4'),
        boxed &&
          'rounded-card border border-line transition duration-200 hover:border-mute has-[:checked]:border-accent has-[:checked]:bg-accent-soft',
        boxed && errorMessage && '!border-accent',
        labelClass,
      ]"
    >
      <!-- Native radio stays in the DOM (arrow keys, forms, screen readers); the circle is drawn beside it. -->
      <span
        class="relative mt-0.5 grid shrink-0 place-items-center"
        :class="sizeClass"
      >
        <input
          v-bind="controlAttrs()"
          :id="inputId"
          ref="el"
          type="radio"
          :name="fieldName"
          :checked="checked"
          :disabled="disabled"
          class="rb-input absolute inset-0 z-10 m-0 h-full w-full cursor-[inherit] opacity-0"
          :aria-invalid="errorMessage ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-required="required || undefined"
          @change="onChange"
          @blur="onBlur"
        />
        <span
          class="rb-ring pointer-events-none grid h-full w-full place-items-center rounded-full border bg-surface transition duration-200"
          :class="[
            tone === 'success' ? 'rb-success' : 'rb-accent',
            errorMessage ? 'border-accent' : 'border-line',
            !disabled && 'group-hover:border-mute',
          ]"
          aria-hidden="true"
        >
          <span class="rb-dot h-1/2 w-1/2 rounded-full" />
        </span>
      </span>

      <span
        v-if="label || description || $slots.default"
        class="min-w-0 flex-1"
        :class="hideLabel && 'sr-only'"
      >
        <span class="block"
          ><slot>{{ label }}</slot></span
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
 * The one radio button for the whole project: a drawn circle whose dot grows in when
 * selected, on top of a real <input type="radio">. Radios that share a `name` form a
 * group (arrow keys move between them, natively). Same vee-validate behaviour as <LazyVInput>.
 *
 *   <LazyVRadioInput v-for="p in plans" :key="p.id" v-model="plan" name="plan" :value="p.id" :label="p.label" />
 *
 *   <LazyVRadioInput v-model="delivery" name="delivery" :value="o.id" boxed>
 *     …any markup…
 *   </LazyVRadioInput>
 *
 * - `v-model` holds the `value` of the selected radio.
 * - `boxed` turns the whole row into a card that highlights when selected; `dense` tightens it.
 * - `description` adds a second line; `size`: sm | md (default) | lg; `tone`: accent | success.
 * - `class` styles the wrapper, `labelClass` the label row. Native attrs go to the input.
 */

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: unknown;
    /** What this radio stands for. */
    value?: unknown;
    /** Shared by every radio of the group. */
    name?: string;
    label?: string;
    /** Secondary line under the label. */
    description?: string;
    hideLabel?: boolean;
    rules?: unknown;
    hint?: string;
    required?: boolean;
    disabled?: boolean;
    /** The whole row becomes a card that highlights when selected. */
    boxed?: boolean;
    /** Tighter padding for `boxed`. */
    dense?: boolean;
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
  value: current,
  errorMessage,
  validate,
  describedBy,
  controlAttrs,
  wrapperAttrs,
  commit,
  recheck,
  onBlur,
} = useFormField(props as never, (v) => emit("update:modelValue", v));

const checked = computed(() => Object.is(current.value, props.value));

const sizeClass = computed(
  () => ({ sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" })[props.size],
);

const onChange = () => {
  commit(props.value, { syncDom: false });
  recheck();
};

defineExpose({
  focus: () => (el.value as HTMLElement | undefined)?.focus(),
  el,
  validate,
});
</script>

<style scoped>
.rb-ring {
  --rb: var(--c-accent);
}

.rb-success {
  --rb: var(--c-success);
}

.rb-dot {
  background-color: rgb(var(--rb));
  transform: scale(0);
  transition: transform 0.2s cubic-bezier(0.22, 0.8, 0.3, 1);
}

.rb-input:checked + .rb-ring {
  border-color: rgb(var(--rb));
}

.rb-input:checked + .rb-ring .rb-dot {
  transform: scale(1);
}

/* The input is invisible, so the focus ring shows on the circle instead. */
.rb-input:focus-visible {
  box-shadow: none;
  outline: none;
}

.rb-input:focus-visible + .rb-ring {
  box-shadow:
    0 0 0 2px rgb(var(--c-ink)),
    0 0 0 4px rgb(var(--c-cyan));
}

.rb-input:active:not(:disabled) + .rb-ring {
  transform: scale(0.92);
}
</style>