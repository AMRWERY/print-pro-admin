<template>
  <auth-shell>
    <template #aside>
      <auth-aside
        eyebrow="Archival registry"
        tag="Master colour calibration bench"
        title="Calibrated optical registries and mechanical print escrows."
        icon="lucide:aperture"
        :stats="[
          { label: 'ISO standard', value: '12647-7' },
          { label: 'Print substrate', value: '310 GSM Rag' },
          { label: 'Order ledger', value: 'Verified' },
        ]"
      />
    </template>

    <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="login-title">
      <!-- Already signed in on this browser -->
      <template v-if="ready && auth.isSignedIn">
        <div class="space-y-2">
          <p class="eyebrow flex items-center gap-2 text-success">
            <Icon
              name="lucide:circle-check"
              size="14"
              aria-hidden="true"
            />Signed in
          </p>
          <h1 id="login-title" class="font-display text-3xl">
            Welcome back, {{ auth.user?.name.split(" ")[0] }}.
          </h1>
          <p class="text-sm text-mute">
            You're signed in as {{ auth.user?.email }}.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <LazyVButton variant="primary" :to="redirect || '/account'">Continue</LazyVButton>
          <LazyVButton variant="secondary" to="/account" icon="lucide:layout-dashboard">Atelier Dashboard</LazyVButton>
          <LazyVButton
            variant="secondary"
            icon="lucide:log-out"
            @click="auth.logout()"
            >Sign out</LazyVButton
          >
        </div>
      </template>

      <template v-else>
        <div class="space-y-2">
          <p class="eyebrow flex items-center gap-2">
            <span class="pip" aria-hidden="true" />Studio account
          </p>
          <h1 id="login-title" class="font-display text-3xl sm:text-4xl">
            Studio sign in
          </h1>
          <p class="text-sm text-mute">
            Access your equipment orders, saved registry and delivery tracking.
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
            label="Email"
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
            label="Password"
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
              >Remember this device</LazyVCheckboxImput
            >

            <LazyVButton variant="tertiary" to="/auth/forgot-password" size="sm"
              >Forgot password?</LazyVButton
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
            {{ lockedFor > 0 ? `Try again in ${lockedFor}s` : "Sign in" }}
          </LazyVButton>
        </form>

        <p class="text-center text-sm text-mute">
          New to PrintPro?
          <LazyVButton
            variant="tertiary"
            to="/auth/register"
            class="!text-accent"
            >Create a studio account</LazyVButton
          >
        </p>

        <p
          class="callout"
          role="note"
        >
          <Icon
            name="lucide:info"
            size="14"
            class="mt-0.5 shrink-0"
            aria-hidden="true"
          />
          Demo accounts: sign-in works against accounts created in this browser
          only. Passwords are salted and hashed, never stored as typed.
        </p>
      </template>
    </section>
  </auth-shell>
</template>

<script lang="ts" setup>
import type { Validatable } from "~/types/auth";

const auth = useAuthStore();
const route = useRoute();
const localePath = useLocalePath();

const ready = ref(false);

onMounted(async () => {
  await nextTick(); // let the store read this browser's saved session
  ready.value = true;
});

const redirect = computed(() => safeRedirect(route.query.redirect));

const notice = computed(() => {
  if (route.query.reset)
    return "Password updated. Sign in with your new password.";
  if (route.query.registered) return "Account created. Sign in to continue.";
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
  loading.value = false;

  if (result.ok) {
    await navigateTo(localePath(redirect.value));
  } else if (result.reason === "locked") {
    lockedFor.value = result.retryInSeconds;
    resume();
    error.value = "Too many attempts. Wait a moment before trying again.";
  } else {
    error.value =
      "That email and password don't match. Check them and try again, or reset your password.";
  }
};

useSeoMeta({
  title: "Sign In",
  description: "Sign in to your studio account.",
  robots: "noindex",
});
</script>