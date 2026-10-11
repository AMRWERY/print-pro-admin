<template>
  <NuxtLayout>
    <div class="container-page py-12 lg:py-20">
      <section
        class="mx-auto max-w-2xl space-y-8 text-center"
        aria-labelledby="error-title"
      >
        <!-- Status -->
        <div class="space-y-4">
          <p
            class="font-mono text-7xl font-bold tracking-tight text-accent sm:text-8xl"
            aria-hidden="true"
          >
            {{ code }}
          </p>
          <p class="eyebrow flex items-center justify-center gap-2">
            <Icon :name="copy.icon" size="14" aria-hidden="true" />{{
              copy.eyebrow
            }}
          </p>
          <h1
            id="error-title"
            ref="heading"
            tabindex="-1"
            class="font-display text-3xl focus:outline-none sm:text-5xl"
          >
            {{ copy.title }}
          </h1>
          <p class="mx-auto max-w-lg text-sm text-mute sm:text-base">
            {{ copy.body }}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <LazyVButton variant="primary" icon="lucide:house" @click="go('/')"
            >Go to home page</LazyVButton
          >
        </div>

        <p class="text-xs text-mute">
          Still stuck? Call the concierge on
          <LazyVButton
            variant="tertiary"
            href="tel:+18004925866"
            class="!text-accent"
            >+1 (800) 492-5866</LazyVButton
          >.
        </p>
      </section>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
const props = defineProps<{ error: NuxtError }>();

const localePath = useLocalePath();
const { locale } = useI18n();
const { theme } = useTheme();

const code = computed(() => props.error.statusCode ?? 500);

// What a visitor sees: plain words for the common cases, never the raw error text.
const copy = computed(() => {
  if (code.value === 404)
    return {
      icon: "lucide:search-x",
      eyebrow: "Page not found",
      title: "We can't find that page",
      body: "It may have moved, or the link might be mistyped. Try searching, or head back to the catalog.",
    };
  if (code.value === 401 || code.value === 403)
    return {
      icon: "lucide:lock",
      eyebrow: "Access restricted",
      title: "You don't have access to this page",
      body: "Sign in with an account that has permission, or head back to the catalog.",
    };
  if (code.value === 429)
    return {
      icon: "lucide:timer",
      eyebrow: "Too many requests",
      title: "Slow down for a moment",
      body: "We've received a lot of requests from you. Wait a minute, then try again.",
    };
  return {
    icon: "lucide:triangle-alert",
    eyebrow: "Something went wrong",
    title: "We hit a problem on our side",
    body: "It isn't anything you did. Try again in a moment, and call us if it keeps happening.",
  };
});

// Leaving the error page means clearing the error, otherwise the app keeps showing it.
const go = (path: string) => clearError({ redirect: localePath(path) });

// Move focus to the heading so screen readers announce what happened.
const heading = ref<HTMLElement>();

onMounted(() => heading.value?.focus());

// app.vue isn't mounted while an error is showing, so set what it normally sets.
useHead({
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => (locale.value === "ar" ? "rtl" : "ltr")),
    "data-theme": computed(() => theme.value),
  },
});

useSeoMeta({
  title: () => `${copy.value.eyebrow}`,
  robots: "noindex",
});
</script>