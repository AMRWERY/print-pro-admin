<template>
  <LazyVMenu label="Account" width="w-64">
    <template #trigger="{ attrs, toggle, open }">
      <button
        v-bind="attrs"
        type="button"
        class="flex items-center gap-2.5 rounded-control p-1 transition duration-fast hover:bg-raised"
        @click="toggle"
      >
        <span class="hidden text-end leading-tight md:block">
          <span class="block text-xs font-semibold">{{ name }}</span>
          <span class="block font-mono text-2xs text-success">Administrator</span>
        </span>
        
        <LazyVAvatar :initials="initials" tone="accent" />
       
        <Icon name="lucide:chevron-down" size="14" class="hidden text-mute transition-transform duration-fast md:block" :class="open && 'rotate-180'" aria-hidden="true" />
        <span class="sr-only">Account menu</span>
      </button>
    </template>

    <template #header>
      <div class="border-b border-line px-4 py-3">
        <p class="truncate text-sm font-semibold">{{ name }}</p>
        <p class="meta truncate">{{ email }}</p>
      </div>
    </template>

    <div class="py-1">
      <nuxt-link-locale to="/profile" role="menuitem" class="menu-item">
        <Icon name="lucide:user-round" size="16" aria-hidden="true" /> Profile
      </nuxt-link-locale>
      
      <nuxt-link-locale to="/settings" role="menuitem" class="menu-item">
        <Icon name="lucide:settings" size="16" aria-hidden="true" /> Settings
      </nuxt-link-locale>
    </div>
  </LazyVMenu>
</template>

<script lang="ts" setup>
const auth = useAuthStore();

const name = computed(() => auth.user?.name ?? "Admin");
const email = computed(() => auth.user?.email ?? "Not signed in");
const initials = computed(() =>
  name.value
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase(),
);

</script>
