<template>
  <auth-shell>
    <template #aside>
      <auth-aside
        :eyebrow="t('auth_ui.admin_signin')"
        :tag="t('auth_ui.aside_tag')"
        :title="t('auth_ui.aside_title')"
        :stats="[
          { label: t('nav.orders'), value: t('auth_ui.stat_orders_val') },
          { label: t('nav.inventory'), value: t('auth_ui.stat_stock_val') },
          { label: t('nav.analytics'), value: t('auth_ui.stat_reports_val') },
        ]"
      />
    </template>

    <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="login-title">
      <div class="space-y-2">
        <p class="eyebrow flex items-center gap-2">
          <span class="pip" aria-hidden="true" />{{ t('auth_ui.admin_account') }}
        </p>
        <h1 id="login-title" class="font-display text-3xl sm:text-4xl">
          {{ t('auth_ui.signin_title') }}
        </h1>
        <p class="text-sm text-mute">
          {{ t('auth_ui.signin_desc') }}
        </p>
      </div>

      <p
        v-if="notice"
        class="flex items-start gap-2 rounded-card border border-success/40 bg-success-soft p-3 text-sm"
        role="status"
      >
        <Icon
          name="lucide:circle-check"
          size="16"
          class="mt-0.5 shrink-0 text-success"
          aria-hidden="true"
        />{{ notice }}
      </p>

      <form class="space-y-4" novalidate @submit.prevent="submit">
        <LazyVInput
          ref="emailField"
          v-model="email"
          name="email"
          type="email"
          :label="t('auth_ui.email_label')"
          :placeholder="t('auth_ui.email_placeholder')"
          required
          rules="required|email"
          autocomplete="email"
          inputmode="email"
          icon="lucide:mail"
        />

        <LazyVInput
          ref="passwordField"
          v-model="password"
          name="password"
          type="password"
          :label="t('auth_ui.password_label')"
          placeholder="*******"
          required
          revealable
          :rules="requiredText('Enter your password.')"
          autocomplete="current-password"
          icon="lucide:key-round"
        />

        <div class="flex flex-wrap items-center justify-between gap-3">
          <LazyVCheckboxImput
            v-model="remember"
            label-class="items-center"
            >{{ t('auth_ui.remember_device') }}</LazyVCheckboxImput
          >

          <LazyVButton variant="tertiary" to="/auth/forgot-password" size="sm"
            >{{ t('auth_ui.forgot_password') }}</LazyVButton
          >
        </div>

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
          :disabled="lockedFor > 0"
          icon-end="lucide:arrow-right"
          icon-end-class="icon-nudge rtl:-scale-x-100"
        >
          {{ lockedFor > 0 ? `${t('btn.try_again_in')} ${lockedFor}s` : t('btn.sign_in') }}
        </LazyVButton>
      </form>
    </section>
  </auth-shell>
</template>

<script lang="ts" setup>
import type { Validatable } from "~/types/auth";

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();

const redirect = computed(() => safeRedirect(route.query.redirect));

const notice = computed(() => {
  if (route.query.reset)
    return t("auth_ui.password_updated_notice");
  return "";
});

const email = ref("");
const password = ref("");
const remember = ref(false);
const emailField = ref<Validatable>();
const passwordField = ref<Validatable>();

const loading = ref(false);
const error = ref("");

// Too many wrong passwords pause sign-in briefly.
const lockedFor = ref(0);

const { pause, resume } = useIntervalFn(
  () => {
    lockedFor.value = Math.max(0, lockedFor.value - 1);
    if (!lockedFor.value) pause();
  },
  1000,
  { immediate: false },
);

const submit = async () => {
  const checks = await Promise.all([
    emailField.value?.validate(),
    passwordField.value?.validate(),
  ]);
  if (checks.some((c) => !c?.valid)) return;

  loading.value = true;
  error.value = "";
  const result = await auth.login(email.value, password.value, remember.value);

  if (result.ok) {
    // Keep the button busy until the dashboard takes over.
    await navigateTo(localePath(redirect.value));
    loading.value = false;
    return;
  }

  loading.value = false;
  if (result.reason === "locked") {
    lockedFor.value = result.retryInSeconds;
    resume();
    error.value = t("auth_ui.too_many_attempts");
  } else {
    error.value = t("auth_ui.invalid_credentials");
  }
};

useSeoMeta({
  title: () => t("auth_ui.signin_seo_title"),
  description: () => t("auth_ui.signin_seo_description"),
  robots: "noindex",
});
</script>