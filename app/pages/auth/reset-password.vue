<template>
  <auth-shell>
    <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="reset-title">
      <div
        v-if="!ready"
        class="space-y-3"
        aria-busy="true"
        aria-label="Checking your link"
      >
        <LazyVSkeletonLoader variant="line" class="!h-8 w-2/3" />
        <LazyVSkeletonLoader class="h-24" />
      </div>

      <!-- Bad or expired link -->
      <template v-else-if="!state.valid">
        <div class="space-y-2">
          <p class="eyebrow-accent">
            <Icon name="lucide:link-2-off" size="14" aria-hidden="true" />{{ t("auth_ui.link_not_valid") }}
          </p>
          <h1 id="reset-title" class="font-display text-3xl">
            {{ t("auth_ui.link_expired_title") }}
          </h1>
          <p class="text-sm text-mute">
            {{ t("auth_ui.link_expired_desc") }}
          </p>
        </div>

        <LazyVButton variant="primary" to="/auth/forgot-password"
          >{{ t("btn.request_new_link") }}</LazyVButton
        >
      </template>

      <!-- New password -->
      <template v-else>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="eyebrow flex items-center gap-2">
              <span class="pip" aria-hidden="true" />{{ t("auth_ui.reset_title") }}
            </p>
            <p
              class="rounded-control border border-line px-2 py-0.5 meta"
              role="timer"
            >
              {{ t("auth_ui.link_expires_in", { time: remaining }) }}
            </p>
          </div>
          <h1 id="reset-title" class="font-display text-3xl sm:text-4xl">
            {{ t("auth_ui.reset_title") }}
          </h1>
          <p class="text-sm text-mute">
            {{ t("auth_ui.reset_desc") }}
          </p>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="submit">
          <LazyVInput
            v-model="password"
            name="password"
            type="password"
            :label="t('profile_ui.new_password')"
            required
            revealable
            :rules="strongPasswordRule"
            autocomplete="new-password"
            icon="lucide:key-round"
          />

          <password-strength :password="password" />

          <LazyVInput
            v-model="confirm"
            name="confirm"
            type="password"
            :label="t('profile_ui.confirm_new_password')"
            required
            revealable
            :rules="matchesRule(() => password)"
            autocomplete="new-password"
            icon="lucide:shield-check"
          />

          <p
            v-if="error"
            class="callout-accent"
            role="alert"
          >
            <Icon
              name="lucide:circle-alert"
              size="16"
              class="bullet-icon"
              aria-hidden="true"
            />{{ error }}
          </p>

          <LazyVButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="loading"
            icon-end="lucide:arrow-right"
            icon-end-class="icon-nudge rtl:-scale-x-100"
            >{{ t("btn.update_password") }}</LazyVButton
          >
        </form>

        <LazyVButton
          variant="tertiary"
          to="/auth"
          icon="lucide:arrow-left"
          icon-class="rtl:-scale-x-100"
          >{{ t("btn.back_to_sign_in") }}</LazyVButton
        >
      </template>
    </section>
  </auth-shell>
</template>

<script lang="ts" setup>
const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();

const token = computed(() =>
  String(
    Array.isArray(route.query.token)
      ? route.query.token[0]
      : (route.query.token ?? ""),
  ),
);

const ready = ref(false);
const state = ref<{ valid: true; expires: number } | { valid: false }>({ valid: false });

onMounted(async () => {
  state.value = await auth.tokenState(token.value);
  ready.value = true;
});

// Re-evaluated every second so the page notices when the link runs out.
const now = ref(Date.now());

useIntervalFn(() => {
  now.value = Date.now();
  if (state.value.valid && state.value.expires <= now.value) state.value = { valid: false };
}, 1000);

const remaining = computed(() => {
  if (!state.value.valid) return "0:00";
  const s = Math.max(0, Math.floor((state.value.expires - now.value) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
});

const password = ref("");
const confirm = ref("");
const loading = ref(false);
const error = ref("");

const { validate } = useForm();

const submit = async () => {
  const result = await validate();
  if (!result.valid) {
    await nextTick();
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }

  loading.value = true;
  error.value = "";
  const done = await auth.resetPassword(token.value, password.value);
  loading.value = false;

  if (!done.ok) {
    error.value = t("auth_ui.link_expired_desc");
    return;
  }
  await navigateTo({ path: localePath("/auth"), query: { reset: "1" } });
};

useSeoMeta({
  title: () => t("auth_ui.reset_seo_title"),
  description: () => t("auth_ui.reset_seo_description"),
  robots: "noindex",
});
</script>