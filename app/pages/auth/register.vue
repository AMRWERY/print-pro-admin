<template>
  <auth-shell>
    <template #aside>
      <auth-aside
        eyebrow="Form 1984-PrintPro"
        tag="Business account"
        title="Create your PrintPro admin account."
        body="Register to manage orders, customers, stock and promotions for printers, photocopiers, ink and toner."
        icon="lucide:printer"
        :points="[
          {
            icon: 'lucide:shield-check',
            title: 'Warehouse and service access',
            body: 'Manage stock, test bays and technician schedules in one place.',
          },
          {
            icon: 'lucide:package-check',
            title: 'Supplies on repeat',
            body: 'Reorder the right ink and toner for every machine you sell.',
          },
        ]"
        :stats="[
          { label: 'Genuine supplies', value: '100%' },
          { label: 'Dispatch', value: 'Same day' },
          { label: 'Transit', value: 'Insured' },
        ]"
      />
    </template>

    <section class="card space-y-4 p-5 sm:p-6" aria-labelledby="register-title">
      <div class="space-y-1.5">
        <p class="eyebrow flex items-center gap-2">
          <span class="pip" aria-hidden="true" />Create account
        </p>
        <h1 id="register-title" class="font-display text-3xl sm:text-3xl">
          Create your account
        </h1>
        <p class="text-sm text-mute">
          Create an account to manage orders, customers and stock.
        </p>
      </div>

      <ol class="flex items-center gap-3" aria-label="Progress">
        <li
          v-for="(label, i) in stepLabels"
          :key="label"
          class="flex flex-1 items-center gap-2"
          :aria-current="step === i + 1 ? 'step' : undefined"
        >
          <span
            class="grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-2xs transition-colors duration-200"
            :class="
              step > i + 1
                ? 'border-success bg-success text-onprimary'
                : step === i + 1
                  ? 'border-accent bg-accent text-onaccent'
                  : 'border-line text-mute'
            "
          >
            <Icon v-if="step > i + 1" name="lucide:check" size="12" aria-hidden="true" />
           
              <template v-else>{{ i + 1 }}</template>
          </span>
          <span
            class="text-sm"
            :class="step === i + 1 ? 'font-medium' : 'text-mute'"
            >{{ label }}</span
          >
          <span
            v-if="i < stepLabels.length - 1"
            class="h-px flex-1 bg-line"
            aria-hidden="true"
          />
        </li>
      </ol>

      <form class="space-y-4" novalidate @submit.prevent="submit">
        <!-- Step 1. v-show (not v-if) keeps every field registered for the final validation. -->
        <fieldset v-show="step === 1" class="grid gap-3 sm:grid-cols-2">
          <legend class="eyebrow mb-1 sm:col-span-2">
            Identity &amp; organisation
          </legend>
          
          <LazyVInput
            v-model="form.name"
            name="name"
            placeholder="e.g. Elena Rostova"
            label="Full name"
            required
            :rules="requiredText('Enter your full name.')"
            autocomplete="name"
          />

          <LazyVInput
            v-model="form.studio"
            name="studio"
            label="Company name"
            placeholder="e.g. Galerie Max Hetzler"
            required
            :rules="requiredText('Enter your company or organisation name.')"
            autocomplete="organization"
          />

          <LazyVInput
            v-model="form.email"
            class="sm:col-span-2"
            name="email"
            type="email"
            label="Email"
            placeholder="name@company.com"
            required
            rules="required|email"
            autocomplete="email"
            inputmode="email"
          />
        </fieldset>

        <fieldset v-show="step === 1" class="space-y-2">
          <legend class="eyebrow mb-1">Account type</legend>
          <div class="grid gap-2 sm:grid-cols-3">
            <LazyVRadioInput
              v-for="t in tiers"
              :key="t.id"
              v-model="form.tier"
              name="tier"
              :value="t.id"
              boxed
              dense
              label-class="h-full"
            >
              <span class="block">
                <span class="eyebrow block">{{ t.tag }}</span>
                <span class="label">{{ t.title }}</span>
                <span class="block line-clamp-2 text-xs text-mute">{{ t.body }}</span>
              </span>
            </LazyVRadioInput>
          </div>
        </fieldset>

        <fieldset v-show="step === 2" class="space-y-3">
          <legend class="eyebrow mb-1">Security credentials</legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <LazyVInput
              v-model="form.password"
              name="password"
              type="password"
              label="Password"
              placeholder="*******"
              required
              revealable
              :rules="strongPasswordRule"
              autocomplete="new-password"
            />

            <LazyVInput
              v-model="form.confirm"
              name="confirm"
              type="password"
              label="Confirm password"
              placeholder="*******"
              required
              revealable
              :rules="matchesRule(() => form.password)"
              autocomplete="new-password"
            />
          </div>

          <password-strength :password="form.password" />
        </fieldset>

        <fieldset v-show="step === 2" class="space-y-2">
          <legend class="eyebrow mb-1">Agreements</legend>
          <LazyVCheckboxImput
            v-model="form.terms"
            name="terms"
            :rules="mustAccept('Accept the terms to create your account.')"
          >
            I agree to the
            <LazyVButton variant="tertiary" to="/" class="!text-accent"
              >terms of sale</LazyVButton
            >
            and the delivery and returns conditions.
          </LazyVCheckboxImput>

          <LazyVCheckboxImput v-model="form.newsletter">
            Send me bi-weekly technical bulletins and new-arrival reports
            <span class="text-mute">(optional)</span>.
          </LazyVCheckboxImput>
        </fieldset>

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
          />
          <span
            >{{ error }}
            <LazyVButton
              v-if="exists"
              variant="tertiary"
              to="/auth"
              class="!text-accent"
              >Sign in instead</LazyVButton
            ></span
          >
        </p>

        <div v-if="step === 1">
          <LazyVButton
            type="submit"
            variant="primary"
            size="lg"
            block
            icon-end="lucide:arrow-right"
            icon-end-class="icon-nudge rtl:-scale-x-100"
            >Continue</LazyVButton
          >
        </div>

        <div v-else class="flex gap-3">
          <LazyVButton
            type="button"
            variant="secondary"
            size="lg"
            icon="lucide:arrow-left"
            icon-class="rtl:-scale-x-100"
            :disabled="loading"
            @click="step = 1"
            >Back</LazyVButton
          >

          <LazyVButton
            type="submit"
            variant="primary"
            size="lg"
            class="flex-1"
            :loading="loading"
            icon-end="lucide:arrow-right"
            icon-end-class="icon-nudge rtl:-scale-x-100"
            >Create account</LazyVButton
          >
        </div>
      </form>

      <p class="text-center text-sm text-mute">
        Already have an account?
        <LazyVButton variant="tertiary" to="/auth" class="!text-accent"
          >Sign in</LazyVButton
        >
      </p>
    </section>
  </auth-shell>
</template>

<script lang="ts" setup>
import { tiers } from "~/data/auth";
import type { Tier } from "~/types/auth";

const auth = useAuthStore();
const localePath = useLocalePath();

const form = reactive({
  name: "",
  studio: "",
  email: "",
  tier: "business" as Tier,
  password: "",
  confirm: "",
  terms: false,
  newsletter: false,
});

// Cross-field rules need every field registered with one form.
const { validate, validateField } = useForm();

const stepLabels = ["Account details", "Security"];
const step = ref(1);

const loading = ref(false);
const error = ref("");
const exists = ref(false);

// Step 1 only checks its own fields; the rest are validated on submit.
const nextStep = async () => {
  const checks = await Promise.all(
    ["name", "studio", "email"].map((field) => validateField(field)),
  );
  if (checks.every((c) => c.valid)) {
    step.value = 2;
    return;
  }
  await nextTick();
  document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
};

const submit = async () => {
  if (step.value === 1) return nextStep();

  const result = await validate();
  if (!result.valid) {
    await nextTick();
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    return;
  }

  loading.value = true;
  error.value = "";
  exists.value = false;

  const created = await auth.register({ ...form });
  if (!created.ok) {
    exists.value = true;
    error.value = "An account with that email already exists.";
    loading.value = false;
    return;
  }

  await auth.login(form.email, form.password, false);
  loading.value = false;
  await navigateTo(localePath("/"));
};

useSeoMeta({
  title: "Create Account",
  description: "Create an admin account.",
  robots: "noindex",
});
</script>