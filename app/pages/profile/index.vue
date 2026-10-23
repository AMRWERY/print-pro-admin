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
          <LazyVAvatar
            :initials="initials"
            tone="accent"
            size="md"
            class="!h-16 !w-16 !text-lg"
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