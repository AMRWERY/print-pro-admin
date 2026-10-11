<template>
  <component
    :is="tag"
    v-bind="{ ...forwardedAttrs, ...rootAttrs }"
    ref="el"
    :class="[attrs.class, classes]"
    :aria-busy="isLoading || undefined"
    @click="onClick"
  >
    <Icon
      v-if="isLoading"
      name="lucide:loader-circle"
      :size="iconSize"
      class="animate-spin"
      aria-hidden="true"
    />
    <Icon
      v-else-if="icon"
      :name="icon"
      :size="iconSize"
      :class="iconClass"
      aria-hidden="true"
    />
    <slot />
    <Icon
      v-if="iconEnd && !isLoading"
      :name="iconEnd"
      :size="iconSize"
      :class="iconEndClass"
      aria-hidden="true"
    />
  </component>
</template>

<script lang="ts" setup>
/**
 * The one button for the whole project. It renders a real <button>, a locale-aware
 * <nuxt-link-locale> (`to`), or a plain <a> (`href`), so "looks like a button" never
 * means the wrong element.
 *
 *   <LazyVButton @click="save">Save</LazyVButton>                         primary action
 *   <LazyVButton variant="secondary" to="/cart">View cart</LazyVButton>    link, secondary look
 *   <LazyVButton variant="icon" aria-label="Close" icon="lucide:x" />      icon-only
 *   <LazyVButton :loading="busy" type="submit" size="lg" block>Pay</LazyVButton>
 *
 * Anything else (aria-*, v-if, class, …) falls through to the element.
 *
 * Loading: pass `loading` yourself, or just make the `@click` handler async (return a
 * Promise): the button shows a spinner and ignores clicks until it settles.
 *
 *   <LazyVButton @click="async () => { await save(); }">Save</LazyVButton>
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Internal route. Renders <nuxt-link-locale> (adds the locale prefix). */
    to?: string | Record<string, unknown>;
    /** External URL, mailto: or tel:. Renders <a>. */
    href?: string;
    /** With `to`: the path already carries the locale (e.g. from switchLocalePath), so don't add it again. */
    localize?: boolean;
    type?: "button" | "submit" | "reset";
    /** primary = main action, secondary = outlined, tertiary = text link, icon = square icon button, plain = no styling. */
    variant?: "primary" | "secondary" | "tertiary" | "icon" | "plain";
    size?: "sm" | "md" | "lg" | "xl";
    /** Full width. */
    block?: boolean;
    /** Shows a spinner, blocks clicks and sets aria-busy. */
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    iconEnd?: string;
    /** Extra classes for the icons, e.g. "icon-bob" or "icon-nudge rtl:-scale-x-100". */
    iconClass?: string;
    iconEndClass?: string;
  }>(),
  { localize: true, type: "button", variant: "primary", size: "md" },
);

const NuxtLinkLocale = resolveComponent("NuxtLinkLocale");
const NuxtLink = resolveComponent("NuxtLink");

const el = ref<unknown>();

const isLink = computed(() => !!props.to || !!props.href);
const tag = computed(() => {
  if (props.to) return props.localize ? NuxtLinkLocale : NuxtLink;
  if (props.href) return "a";
  return "button";
});

const attrs = useAttrs();

// Everything but class and the click handler goes straight to the element; the click is
// run here so a returned Promise can drive the loading state.
const forwardedAttrs = computed(() => {
  const { class: _c, onClick: _o, ...rest } = attrs;
  return rest;
});

const busy = ref(false);
const isLoading = computed(() => props.loading || busy.value);
const blocked = computed(() => props.disabled || isLoading.value);

const onClick = async (e: Event) => {
  if (blocked.value) {
    e.preventDefault();
    return;
  }
  const handler = attrs.onClick as
    | ((e: Event) => unknown)
    | ((e: Event) => unknown)[]
    | undefined;
  const pending = (Array.isArray(handler) ? handler : handler ? [handler] : [])
    .map((fn) => fn(e))
    .filter((r): r is Promise<unknown> => !!r && typeof (r as Promise<unknown>).then === "function");
  if (!pending.length) return;
  busy.value = true;
  try {
    await Promise.allSettled(pending);
  } finally {
    busy.value = false;
  }
};

const external = computed(
  () => !!props.href && /^https?:\/\//.test(props.href),
);

const rootAttrs = computed(() => {
  if (props.to)
    return blocked.value
      ? { to: props.to, "aria-disabled": "true", tabindex: -1 }
      : { to: props.to };
  if (props.href) {
    return {
      href: blocked.value ? undefined : props.href,
      "aria-disabled": blocked.value || undefined,
      tabindex: blocked.value ? -1 : undefined,
      ...(external.value
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {}),
    };
  }
  return { type: props.type, disabled: blocked.value };
});

const variantClass = {
  primary: "btn-accent",
  secondary: "btn-ghost",
  tertiary: "link-quiet",
  icon: "btn-icon",
  plain: "",
} as const;

// Sizes only change dimensions, so they match the raw utility classes used before.
const sizeClass = computed(() => {
  const { variant, size } = props;
  if (variant === "icon") return size === "sm" ? "h-9 w-9" : "";
  if (variant === "primary" || variant === "secondary")
    return {
      sm: "!px-3 !py-1.5 text-xs",
      md: "",
      lg: "h-12",
      xl: "h-14 text-base",
    }[size];
  if (variant === "tertiary") return size === "sm" ? "text-xs" : "";
  return "";
});

const classes = computed(() => [
  variantClass[props.variant],
  sizeClass.value,
  props.block && "w-full",
  props.variant === "tertiary" &&
    (props.icon || props.iconEnd) &&
    "inline-flex items-center gap-1.5",
  isLink.value && blocked.value && "pointer-events-none opacity-40",
  isLoading.value && "cursor-progress",
]);

const iconSize = computed(
  () => ({ sm: 14, md: 16, lg: 18, xl: 18 })[props.size],
);

defineExpose({
  focus: () =>
    (
      el.value as { $el?: HTMLElement } | HTMLElement | undefined as
        | { $el?: HTMLElement; focus?: () => void }
        | undefined
    )?.$el?.focus?.() ?? (el.value as HTMLElement | undefined)?.focus?.(),
  el,
});
</script>