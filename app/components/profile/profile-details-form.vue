<template>
  <LazyVPanel
    :title="$t('profile_ui.personal_details')"
    :subtitle="$t('profile_ui.personal_details_subtitle')"
    icon="lucide:user-round"
  >
    <form class="space-y-4" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <LazyVInput
          v-model="form.name"
          name="profileName"
          :label="$t('customers_ui.full_name')"
          required
          rules="required|min:2|max:80"
          maxlength="80"
          autocomplete="name"
        />

        <LazyVInput
          v-model="form.title"
          name="profileTitle"
          :label="$t('profile_ui.job_title')"
          optional
          maxlength="80"
          autocomplete="organization-title"
        />

        <LazyVInput
          v-model="form.studio"
          name="profileStudio"
          :label="$t('customers_ui.organization')"
          required
          rules="required|min:2|max:120"
          maxlength="120"
          autocomplete="organization"
        />

        <LazyVInput
          v-model="form.phone"
          name="profilePhone"
          type="tel"
          :label="$t('profile_ui.phone')"
          optional
          :rules="optionalPhone"
          maxlength="30"
          autocomplete="tel"
        />
      </div>

      <div>
        <p class="label">{{ $t('auth_ui.email_label') }}</p>
        <p class="field mt-1.5 text-sm text-mute" dir="ltr">
          {{ account.email }}
        </p>
        <p class="mt-1 text-xs text-mute">
          {{ $t('profile_ui.email_note') }}
        </p>
      </div>

      <div
        class="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4"
      >
        <span v-if="dirty" class="me-auto font-mono text-2xs text-yellow"
          >{{ $t('common_ui.unsaved_changes') }}</span
        >
        <LazyVButton
          variant="tertiary"
          :disabled="!dirty || saving"
          @click="reset"
          >{{ $t('btn.reset') }}</LazyVButton
        >

        <LazyVButton
          type="submit"
          icon="lucide:save"
          :loading="saving"
          :disabled="!dirty"
          >{{ $t('btn.save_changes') }}</LazyVButton
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
const { t } = useI18n();

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
  const res = await auth.updateProfile({
    name: form.name.trim(),
    studio: form.studio.trim(),
    title: form.title.trim() || undefined,
    phone: form.phone.trim() || undefined,
  });
  saving.value = false;
  if (!res.ok) {
    toast.error(t('profile_ui.toast_update_error'));
    return;
  }
  toast.success(t('profile_ui.toast_updated'));
};
</script>