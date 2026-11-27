<template>
  <div class="space-y-5">
    <LazyVPageHeader
      :title="$t('profile_ui.title')"
      :description="$t('profile_ui.description')"
      :breadcrumb="[{ label: $t('nav.dashboard'), to: '/' }, { label: $t('nav.profile') }]"
    />

    <!-- The account lives in this browser and loads after the page does. -->
    <div
      v-if="!mounted"
      class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]"
      aria-busy="true"
    >
      <LazyVSkeletonLoader class="h-72" />
      <div class="space-y-4">
        <LazyVSkeletonLoader class="h-64" />

        <LazyVSkeletonLoader class="h-72" />
      </div>
    </div>

    <LazyVEmptyState
      v-else-if="!account"
      icon="lucide:user-round-x"
      :title="$t('profile_ui.not_signed_in_title')"
      :description="$t('profile_ui.not_signed_in_desc')"
      :eyebrow="$t('profile_ui.no_session_eyebrow')"
      :tag="$t('profile_ui.signed_out_tag')"
    >
      <LazyVButton to="/auth" icon="lucide:log-in">{{ $t('btn.sign_in') }}</LazyVButton>
    </LazyVEmptyState>

    <div
      v-else
      class="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]"
    >
      <LazyVPanel
        :title="$t('layout_ui.account')"
        icon="lucide:id-card"
        class="lg:sticky lg:top-24"
      >
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="relative">
            <LazyVAvatar
              :initials="initials"
              :src="account.avatar"
              tone="accent"
              size="md"
              class="!h-24 !w-24 !text-2xl"
            />
            <!-- Removing sits on the photo itself, at its corner. -->
            <button
              v-if="account.avatar"
              type="button"
              class="absolute -end-0 -top-0 grid h-5 w-5 place-items-center rounded-full border border-line bg-surface text-mute shadow transition duration-fast hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
              :disabled="photoBusy"
              :aria-label="$t('btn.remove_photo')"
              @click="removePhoto"
            >
              <Icon name="lucide:x" size="14" aria-hidden="true" />
            </button>
          </div>

          <LazyVButton
            size="sm"
            variant="secondary"
            icon="lucide:image"
            :loading="photoBusy"
            @click="photoInput?.click()"
            >{{ account.avatar ? $t('btn.change_photo') : $t('btn.add_photo') }}</LazyVButton
          >
          <input
            ref="photoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="sr-only"
            tabindex="-1"
            :aria-label="$t('profile_ui.choose_photo')"
            @change="onPhoto"
          />
          <div class="min-w-0">
            <p class="font-display text-xl font-bold leading-tight">
              {{ account.name }}
            </p>
            <p v-if="account.title" class="meta">{{ account.title }}</p>
            <p class="meta">{{ account.studio }}</p>
          </div>

          <LazyVStatusBadge tone="warning" icon="lucide:badge-check">{{
            tierTitle
          }}</LazyVStatusBadge>
        </div>

        <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div>
            <dt class="label-caps">{{ $t('auth_ui.email_label') }}</dt>
            <dd class="break-all font-mono text-xs" dir="ltr">
              {{ account.email }}
            </dd>
          </div>
          <div v-if="account.phone">
            <dt class="label-caps">{{ $t('profile_ui.phone') }}</dt>
            <dd class="font-mono text-xs" dir="ltr">{{ account.phone }}</dd>
          </div>
          <div>
            <dt class="label-caps">{{ $t('profile_ui.member_since') }}</dt>
            <dd class="font-mono text-xs">{{ memberSince }}</dd>
          </div>
        </dl>

        <LazyVButton
          class="mt-4"
          block
          variant="secondary"
          icon="lucide:log-out"
          @click="signOut"
          >{{ $t('btn.sign_out') }}</LazyVButton
        >
      </LazyVPanel>

      <div class="min-w-0 space-y-4">
        <profile-details-form :key="account.id" :account="account" />

        <profile-password-form />

        <profile-preferences :account="account" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { tiers } from "~/data/auth";

const { t } = useI18n();
const auth = useAuthStore();
const localePath = useLocalePath();

// useMounted keeps the first render the same on the server and in the browser.
const mounted = useMounted();

const account = computed(() => auth.user);

const initials = computed(() =>
  (account.value?.name ?? "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);

const tierTitle = computed(
  () => tiers.find((t) => t.id === account.value?.tier)?.title ?? t('profile_ui.member_default'),
);

const memberSince = computed(() =>
  account.value
    ? new Date(account.value.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "",
);

// --- Profile photo: shrunk to a small square-friendly JPEG in the browser, then saved with the profile ---
const toast = useToast();
const photoInput = ref<HTMLInputElement | null>(null);
const photoBusy = ref(false);

const savePhoto = async (avatar: string, done: string) => {
  photoBusy.value = true;
  const res = await auth.updateProfile({ avatar });
  photoBusy.value = false;
  if (res.ok) toast.success(done);
  else toast.warning(t('profile_ui.photo_not_saved'), { description: t('profile_ui.photo_not_saved_desc') });
};

const onPhoto = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = ""; // so choosing the same file again still fires
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.warning(t('profile_ui.not_an_image'), { description: t('profile_ui.not_an_image_desc') });
    return;
  }
  photoBusy.value = true;
  try {
    const { url } = await toWebImage(file, 320, 40_000);
    await savePhoto(url, t('profile_ui.photo_updated'));
  } catch {
    photoBusy.value = false;
    toast.warning(t('profile_ui.photo_not_added'), { description: t('profile_ui.photo_not_added_desc') });
  }
};

const removePhoto = () => savePhoto("", t('profile_ui.photo_removed'));

const signOut = async () => {
  auth.logout();
  await navigateTo(localePath("/auth"));
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: () => t('profile_ui.seo_title'),
  description: () => t('profile_ui.seo_description'),
});
</script>