<template>
  <div class="space-y-5">
    <LazyVPageHeader
      title="Profile"
      description="Your account details, password and preferences."
      :breadcrumb="[{ label: 'Dashboard', to: '/' }, { label: 'Profile' }]"
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
      title="You're not signed in"
      description="Sign in to see and change your profile, password and preferences."
      eyebrow="ACCOUNT :: NO_SESSION"
      tag="SIGNED OUT"
    >
      <LazyVButton to="/auth" icon="lucide:log-in">Sign in</LazyVButton>
    </LazyVEmptyState>

    <div
      v-else
      class="grid items-start gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]"
    >
      <LazyVPanel
        title="Account"
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
              aria-label="Remove profile photo"
              @click="removePhoto"
            >
              <Icon name="lucide:x" size="14" aria-hidden="true" />
            </button>
          </div>

          <LazyVButton
            size="sm"
            variant="secondary"
            icon="lucide:camera"
            :loading="photoBusy"
            @click="photoInput?.click()"
            >{{ account.avatar ? "Change photo" : "Add photo" }}</LazyVButton
          >
          <input
            ref="photoInput"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            class="sr-only"
            tabindex="-1"
            aria-label="Choose a profile photo"
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
            <dt class="label-caps">Email</dt>
            <dd class="break-all font-mono text-xs" dir="ltr">
              {{ account.email }}
            </dd>
          </div>
          <div v-if="account.phone">
            <dt class="label-caps">Phone</dt>
            <dd class="font-mono text-xs" dir="ltr">{{ account.phone }}</dd>
          </div>
          <div>
            <dt class="label-caps">Member since</dt>
            <dd class="font-mono text-xs">{{ memberSince }}</dd>
          </div>
        </dl>

        <LazyVButton
          class="mt-4"
          block
          variant="secondary"
          icon="lucide:log-out"
          @click="signOut"
          >Sign out</LazyVButton
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
  () => tiers.find((t) => t.id === account.value?.tier)?.title ?? "Member",
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
  else toast.warning("Photo not saved", { description: "The server could not be reached or refused the image. Try again." });
};

const onPhoto = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = ""; // so choosing the same file again still fires
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.warning("Not an image", { description: "Choose a JPG, PNG or WebP photo." });
    return;
  }
  photoBusy.value = true;
  try {
    const { url } = await toWebImage(file, 320, 40_000);
    await savePhoto(url, "Profile photo updated");
  } catch {
    photoBusy.value = false;
    toast.warning("Photo not added", { description: "That file could not be read as an image. Try another one." });
  }
};

const removePhoto = () => savePhoto("", "Profile photo removed");

const signOut = async () => {
  auth.logout();
  await navigateTo(localePath("/auth"));
};

definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Profile",
  description: "Your admin profile, password and preferences.",
});
</script>