<template>
  <LazyVPanel
    title="Personal details"
    subtitle="Shown to your team and on the documents you sign"
    icon="lucide:user-round"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="profileName"
          label="Full name"
          required
          rules="required|min:2|max:80"
          maxlength="80"
          autocomplete="name"
        />

        <LazyVInput
          v-model="form.title"
          name="profileTitle"
          label="Job title"
          optional
          maxlength="80"
          autocomplete="organization-title"
        />

        <LazyVInput
          v-model="form.studio"
          name="profileStudio"
          label="Organization"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          autocomplete="organization"
        />

        <LazyVInput
          v-model="form.phone"
          name="profilePhone"
          type="tel"
          label="Phone"
          optional
          :rules="optionalPhone"
          maxlength="30"
          autocomplete="tel"
        />
      </div>

      <div>
        <p class="label">Email</p>
        <p class="field mt-1.5 text-sm text-mute" dir="ltr">
          {{ account.email }}
        </p>
        <p class="mt-1 text-xs text-mute">
          Your email is your sign-in. It can't be changed here.
        </p>
      </div>

      <div
        class="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4"
      >
        <span v-if="dirty" class="me-auto font-mono text-2xs text-yellow"
          >Unsaved changes</span
        >
        <LazyVButton
          variant="tertiary"
          :disabled="!dirty || saving"
          @click="reset"
          >Reset</LazyVButton
        >

        <LazyVButton
          type="submit"
          icon="lucide:save"
          :loading="saving"
          :disabled="!dirty"
          >Save changes</LazyVButton
        >
      </div>
    </form>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { Account } from "~/types/auth";

const props = defineProps<{ account: Account }>();

const auth = useAuthStore();
const toast = useToast();

const initial = () => ({
  name: props.account.name,
  studio: props.account.studio,
  title: props.account.title ?? "",
  phone: props.account.phone ?? "",
});

const form = reactive(initial());
const saving = ref(false);

// Phone is optional, but when something is typed it has to be a number someone can call.
const optionalPhone = (v: unknown) =>
  String(v ?? "").trim() ? phoneRule(v) : true;

const dirty = computed(() => {
  const start = initial();
  return (Object.keys(start) as (keyof typeof start)[]).some(
    (k) => form[k].trim() !== start[k],
  );
});

const { validate, resetForm } = useForm();

const reset = () => {
  Object.assign(form, initial());
  resetForm();
};

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  saving.value = true;
  // The store works in this browser, so a short pause stands in for the save.
  await new Promise((r) => setTimeout(r, 250));
  auth.updateProfile({
    name: form.name.trim(),
    studio: form.studio.trim(),
    title: form.title.trim() || undefined,
    phone: form.phone.trim() || undefined,
  });
  saving.value = false;
  toast.success("Profile updated");
};
</script>