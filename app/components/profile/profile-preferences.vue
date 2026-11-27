<template>
  <LazyVPanel
    :title="$t('profile_ui.preferences_title')"
    :subtitle="$t('profile_ui.preferences_applied')"
    icon="lucide:sliders-horizontal"
  >
    <div class="space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium">{{ $t('profile_ui.appearance') }}</p>
          <p class="text-xs text-mute">
            {{ $t('profile_ui.appearance_hint') }}
          </p>
        </div>

        <LazyVSegmented
          v-model="appearance"
          :label="$t('profile_ui.appearance')"
          :options="appearanceOptions"
        />
      </div>

      <div class="border-t border-line pt-4">
        <LazyVCheckboxImput
          :model-value="account.newsletter"
          name="profileNewsletter"
          :label="$t('profile_ui.newsletter_label')"
          :description="$t('profile_ui.newsletter_desc')"
          @update:model-value="setNewsletter"
        />
      </div>
    </div>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { Account } from "~/types/auth";
import type { Theme } from "~/types/themes";

defineProps<{ account: Account }>();

const auth = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const { theme, toggle } = useTheme();

const appearanceOptions = computed(() => [
  { value: "dark" as const, label: t('profile_ui.appearance_dark') },
  { value: "light" as const, label: t('profile_ui.appearance_light') },
]);

// The theme is a cookie that flips with a short reveal animation, so a change goes through toggle().
const appearance = computed<Theme>({
  get: () => theme.value,
  set: (next) => {
    if (next === theme.value) return;
    toggle();
    toast.success(
      next === "dark" ? t('profile_ui.toast_dark_on') : t('profile_ui.toast_light_on'),
    );
  },
});

const setNewsletter = async (value: unknown) => {
  const res = await auth.updateProfile({ newsletter: value === true });
  if (!res.ok) {
    toast.error(t('profile_ui.toast_prefs_error'));
    return;
  }
  toast.success(
    value === true
      ? t('profile_ui.toast_subscribed')
      : t('profile_ui.toast_unsubscribed'),
  );
};
</script>