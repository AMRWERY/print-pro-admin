<template>
  <LazyVPanel
    title="Password"
    subtitle="Use a long, unique password. You stay signed in on this device."
    icon="lucide:lock"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <LazyVInput
        v-model="form.current"
        name="currentPassword"
        type="password"
        label="Current password"
        required
        revealable
        rules="required"
        autocomplete="current-password"
        class="sm:max-w-sm"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.next"
          name="newPassword"
          type="password"
          label="New password"
          required
          revealable
          :rules="strongPasswordRule"
          autocomplete="new-password"
        />

        <LazyVInput
          v-model="form.confirm"
          name="confirmPassword"
          type="password"
          label="Confirm new password"
          required
          revealable
          :rules="matchesRule(() => form.next)"
          autocomplete="new-password"
        />
      </div>

      <password-strength :password="form.next" />

      <p v-if="error" class="callout-accent" role="alert">
        <Icon
          name="lucide:circle-alert"
          size="16"
          class="bullet-icon"
          aria-hidden="true"
        />
        {{ error }}
      </p>

      <div class="flex justify-end border-t border-line pt-4">
        <LazyVButton type="submit" icon="lucide:key-round" :loading="saving"
          >Update password</LazyVButton
        >
      </div>
    </form>
  </LazyVPanel>
</template>

<script lang="ts" setup>
const auth = useAuthStore();
const toast = useToast();

const form = reactive({ current: "", next: "", confirm: "" });
const error = ref("");
const saving = ref(false);

const { validate, resetForm } = useForm();

const submit = async () => {
  error.value = "";
  const { valid } = await validate();
  if (!valid) return;

  saving.value = true;
  const result = await auth.changePassword(form.current, form.next);
  saving.value = false;

  if (!result.ok) {
    error.value = "The current password is wrong. Check it and try again.";
    return;
  }
  Object.assign(form, { current: "", next: "", confirm: "" });
  resetForm();
  toast.success("Password updated", {
    description: "Use the new password next time you sign in.",
  });
};
</script>