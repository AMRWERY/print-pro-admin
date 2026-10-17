<template>
  <LazyVPanel
    title="Preferences"
    subtitle="Applied straight away"
    icon="lucide:sliders-horizontal"
  >
    <div class="space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium">Appearance</p>
          <p class="text-xs text-mute">
            Dark is easier on the eyes in the cleanroom. Light suits bright
            offices.
          </p>
        </div>

        <LazyVSegmented
          v-model="appearance"
          label="Appearance"
          :options="appearanceOptions"
        />
      </div>

      <div class="border-t border-line pt-4">
        <LazyVCheckboxImput
          :model-value="account.newsletter"
          name="profileNewsletter"
          label="Product and stock announcements"
          description="Occasional email about new equipment, restocks and calibration notices."
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
const { theme, toggle } = useTheme();

const appearanceOptions = [
  { value: "dark" as const, label: "Dark" },
  { value: "light" as const, label: "Light" },
];

// The theme is a cookie that flips with a short reveal animation, so a change goes through toggle().
const appearance = computed<Theme>({
  get: () => theme.value,
  set: (next) => {
    if (next !== theme.value) toggle();
  },
});

const setNewsletter = (value: unknown) => {
  auth.updateProfile({ newsletter: value === true });
  toast.success(
    value === true
      ? "Subscribed to announcements"
      : "Unsubscribed from announcements",
  );
};
</script>