import type { FieldProps } from "~/types/shared/form-fields";

/**
 * The vee-validate wiring shared by VInput, VSelectInput and VTextarea:
 * registers the field (by `name`, inside a useForm() or on its own), keeps it in step with
 * `v-model`, and validates on blur, then again while typing once an error is showing.
 */

export const useFormField = (props: FieldProps, emit: (v: unknown) => void) => {
  const attrs = useAttrs();
  const uid = useId();
  const el = ref<HTMLElement>();

  const fieldName = computed(() => props.name || `field-${uid}`);
  const inputId = computed(() => (attrs.id as string | undefined) ?? uid);

  const { value, errorMessage, validate, handleChange, setValue } =
    useField<unknown>(fieldName, toRef(props, "rules") as never, {
      initialValue: props.modelValue,
      label: props.label,
      validateOnValueUpdate: false,
      keepValueOnUnmount: false,
    });

  // Parent -> field
  watch(
    () => props.modelValue,
    (v) => {
      if (!Object.is(v, value.value)) setValue(v, false);
    },
  );

  const describedBy = computed(() =>
    errorMessage.value
      ? `${inputId.value}-error`
      : props.hint
        ? `${inputId.value}-hint`
        : undefined,
  );

  // Everything except class/style/id goes to the control, so native attributes just work.
  const controlAttrs = () => {
    const { class: _c, style: _s, id: _i, ...rest } = attrs;
    return rest;
  };

  // The mirror image of controlAttrs: class and style belong to the wrapper element.
  // Bind with `v-bind="wrapperAttrs()"` (components set `inheritAttrs: false`).
  const wrapperAttrs = () => ({ class: attrs.class, style: attrs.style });

  /** Writes a value: field state first, then the parent. */
  const commit = (
    v: unknown,
    opts: { syncDom?: boolean } = { syncDom: true },
  ) => {
    handleChange(v, false);
    emit(v);
    // The parent may normalise the value (clamp, reformat). Make the field follow it.
    nextTick(() => {
      if (
        props.modelValue !== undefined &&
        !Object.is(props.modelValue, value.value)
      ) {
        setValue(props.modelValue, false);
      }
      const node = el.value as HTMLInputElement | undefined;
      if (opts.syncDom && node && node.value !== String(value.value ?? "")) {
        node.value = String(value.value ?? "");
      }
    });
  };

  /** Once an error is showing, tell the user as soon as it is fixed. */
  const recheck = () => {
    if (errorMessage.value) validate();
  };

  const onBlur = () => {
    if (props.rules) validate();
  };

  return {
    uid,
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
    setValue,
  };
};
