<template>
  <auth-shell>
    <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="forgot-title">
      <!-- Sent -->
      <template v-if="sent">
        <div class="space-y-2">
          <p class="eyebrow flex items-center gap-2 text-success">
            <Icon name="lucide:mail-check" size="14" aria-hidden="true" />Check
            your inbox
          </p>
          <h1
            id="forgot-title"
            ref="heading"
            tabindex="-1"
            class="font-display text-3xl focus:outline-none"
          >
            Recovery link sent
          </h1>
          <p class="text-sm text-mute">
            If <span class="text-paper">{{ email }}</span> belongs to a studio
            account, you'll receive a one-time link valid for 15 minutes. Check
            your spam folder if it doesn't arrive.
          </p>
        </div>

        <div
          class="space-y-3 rounded-card border border-yellow/40 bg-yellow-soft p-4 text-sm"
          role="note"
        >
          <p class="flex items-center gap-2 font-medium">
            <Icon
              name="lucide:flask-conical"
              size="16"
              aria-hidden="true"
            />Demo mode
          </p>
          <p class="text-mute">
            No email is sent from this demo. Use the link below to continue.
          </p>
          <LazyVButton
            variant="primary"
            size="sm"
            :to="{ path: '/reset-password', query: { token: sent.token } }"
            icon-end="lucide:arrow-right"
            icon-end-class="icon-nudge rtl:-scale-x-100"
            >Open reset link</LazyVButton
          >
        </div>

        <LazyVButton
          variant="tertiary"
          to="/auth"
          icon="lucide:arrow-left"
          icon-class="rtl:-scale-x-100"
          >Back to sign in</LazyVButton
        >
      </template>

      <!-- Ask -->
      <template v-else>
        <div class="space-y-2">
          <p class="eyebrow flex items-center gap-2">
            <span class="pip" aria-hidden="true" />Account
            recovery
          </p>
          <h1 id="forgot-title" class="font-display text-3xl sm:text-4xl">
            Reset your password
          </h1>
          <p class="text-sm text-mute">
            Enter your studio email. We'll send a one-time link, valid for 15
            minutes, to set a new password.
          </p>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="submit">
          <LazyVInput
            ref="emailField"
            v-model="email"
            name="email"
            type="email"
            label="Studio email"
            required
            rules="required|email"
            autocomplete="email"
            inputmode="email"
            icon="lucide:mail"
          />
          <LazyVButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="loading"
            icon-end="lucide:arrow-right"
            icon-end-class="icon-nudge rtl:-scale-x-100"
            >Send recovery link</LazyVButton
          >
        </form>

        <div
          class="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm"
        >
          <LazyVButton
            variant="tertiary"
            to="/auth"
            icon="lucide:arrow-left"
            icon-class="rtl:-scale-x-100"
            >Back to sign in</LazyVButton
          >

          <LazyVButton
            variant="tertiary"
            href="tel:+18004925866"
            icon="lucide:headset"
            >Need help? +1 (800) 492-5866</LazyVButton
          >
        </div>
      </template>
    </section>
  </auth-shell>
</template>

<script lang="ts" setup>
import type { Validatable } from "~/types/auth";

const auth = useAuthStore();

const email = ref("");
const emailField = ref<Validatable>();
const loading = ref(false);
const sent = ref<{ token: string; expires: number } | null>(null);
const heading = ref<HTMLElement>();

const submit = async () => {
  const check = await emailField.value?.validate();
  if (!check?.valid) return;

  loading.value = true;
  await new Promise((r) => setTimeout(r, 500)); // there is no mail server; keep the feedback brief
  // The same answer whether or not the email is registered, so this form can't be used to find accounts.
  sent.value = auth.requestReset(email.value);
  loading.value = false;

  await nextTick();
  heading.value?.focus();
};

useSeoMeta({
  title: "Reset Password",
  description: "Reset your studio account password.",
  robots: "noindex",
});
</script>