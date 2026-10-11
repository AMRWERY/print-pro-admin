<template>
  <auth-shell>
    <template #aside>
      <auth-aside
        eyebrow="Form 1984-PrintPro"
        tag="Archival audit"
        title="Establish your studio registry."
        body="Register your atelier, gallery or independent studio for calibrated equipment, bulk media allocations and tracked delivery."
        icon="lucide:landmark"
        :points="[
          {
            icon: 'lucide:shield-check',
            title: 'Bench & cleanroom access',
            body: 'Calibrated sensor arrays, vacuum print beds and zero-deflection glass.',
          },
          {
            icon: 'lucide:package-check',
            title: 'Priority allocations',
            body: 'Direct quotas on archival cotton rag and custom mounts.',
          },
        ]"
        :stats="[
          { label: 'MTF bench', value: '99.4%' },
          { label: 'Max cotton', value: '640 g/m²' },
          { label: 'Transit', value: 'Insured' },
        ]"
      />
    </template>

    <section class="card space-y-5 p-6 sm:p-8" aria-labelledby="register-title">
      <div class="space-y-2">
        <p class="eyebrow flex items-center gap-2">
          <span class="pip" aria-hidden="true" />Create account
        </p>
        <h1 id="register-title" class="font-display text-3xl sm:text-4xl">
          Establish studio registry
        </h1>
        <p class="text-sm text-mute">
          Create a studio account to save your registry, place orders and track
          delivery.
        </p>
      </div>

      <form class="space-y-6" novalidate @submit.prevent="submit">
        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="eyebrow mb-3 sm:col-span-2">
            01 · Identity &amp; organisation
          </legend>
          
          <LazyVInput
            v-model="form.name"
            name="name"
            label="Full name"
            required
            :rules="requiredText('Enter your full name.')"
            autocomplete="name"
            placeholder="e.g. Elena Rostova"
          />

          <LazyVInput
            v-model="form.studio"
            name="studio"
            label="Studio or atelier name"
            required
            :rules="requiredText('Enter your studio or organisation name.')"
            autocomplete="organization"
            placeholder="e.g. Galerie Max Hetzler"
          />

          <LazyVInput
            v-model="form.email"
            class="sm:col-span-2"
            name="email"
            type="email"
            label="Studio email"
            required
            rules="required|email"
            autocomplete="email"
            inputmode="email"
            placeholder="curator@atelier.com"
          />
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="eyebrow mb-1">Studio tier</legend>
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
                <span class="block text-xs text-mute">{{ t.body }}</span>
              </span>
            </LazyVRadioInput>
          </div>
        </fieldset>

        <fieldset class="space-y-4">
          <legend class="eyebrow mb-3">02 · Security credentials</legend>
          <div class="grid gap-4 sm:grid-cols-2">
            <LazyVInput
              v-model="form.password"
              name="password"
              type="password"
              label="Password"
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
              required
              revealable
              :rules="matchesRule(() => form.password)"
              autocomplete="new-password"
            />
          </div>

          <password-strength :password="form.password" />
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="eyebrow mb-1">03 · Agreements</legend>
          <LazyVCheckboxImput
            v-model="form.terms"
            name="terms"
            :rules="mustAccept('Accept the terms to create your account.')"
          >
            I agree to the
            <LazyVButton variant="tertiary" to="/" class="!text-accent"
              >terms of sale</LazyVButton
            >
            and the transit and escrow conditions.
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

        <LazyVButton
          type="submit"
          variant="primary"
          size="lg"
          block
          :loading="loading"
          icon-end="lucide:arrow-right"
          icon-end-class="icon-nudge rtl:-scale-x-100"
          >Create studio account</LazyVButton
        >
      </form>

      <p class="text-center text-sm text-mute">
        Already have an account?
        <LazyVButton variant="tertiary" to="/auth" class="!text-accent"
          >Sign in</LazyVButton
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
        Demo accounts are saved in this browser only. Passwords are salted and
        hashed, never stored as typed.
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
  tier: "atelier" as Tier,
  password: "",
  confirm: "",
  terms: false,
  newsletter: false,
});

// Cross-field rules need every field registered with one form.
const { validate } = useForm();

const loading = ref(false);
const error = ref("");
const exists = ref(false);

const submit = async () => {
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
  description: "Create a studio account.",
  robots: "noindex",
});
</script>