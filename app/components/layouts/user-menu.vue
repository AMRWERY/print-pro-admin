<template>
  <div ref="root" class="relative" @keydown.esc="close(true)">
    <button
      ref="trigger"
      type="button"
      class="flex items-center gap-2.5 rounded-control p-1 transition duration-fast hover:bg-raised"
      aria-haspopup="menu"
      :aria-expanded="open"
      aria-controls="user-menu"
      @click="toggle"
    >
      <span class="hidden text-end leading-tight md:block">
        <span class="block text-xs font-semibold">{{ name }}</span>
        <span class="block font-mono text-2xs text-success">Administrator</span>
      </span>
      <span class="grid h-10 w-10 place-items-center rounded-full bg-accent font-mono text-sm font-bold text-onaccent" aria-hidden="true">{{ initials }}</span>
      <Icon name="lucide:chevron-down" size="14" class="hidden text-mute transition-transform duration-fast md:block" :class="open && 'rotate-180'" aria-hidden="true" />
      <span class="sr-only">Account menu</span>
    </button>

    <Transition name="fade">
      <div
        v-if="open"
        id="user-menu"
        ref="menu"
        role="menu"
        aria-label="Account"
        class="absolute end-0 z-30 mt-2 w-64 overflow-hidden rounded-card border border-line bg-surface shadow-xl shadow-black/40"
        @keydown="onKey"
      >
        <div class="border-b border-line px-4 py-3">
          <p class="truncate text-sm font-semibold">{{ name }}</p>
          <p class="meta truncate">{{ email }}</p>
        </div>

        <ul class="py-1">
          <li role="none">
            <NuxtLinkLocale to="/profile" role="menuitem" class="menu-item" @click="close()">
              <Icon name="lucide:user-round" size="16" aria-hidden="true" /> Profile
            </NuxtLinkLocale>
          </li>
          <li role="none">
            <NuxtLinkLocale to="/settings" role="menuitem" class="menu-item" @click="close()">
              <Icon name="lucide:settings" size="16" aria-hidden="true" /> Settings
            </NuxtLinkLocale>
          </li>
        </ul>

        <div class="border-t border-line py-1">
          <button type="button" role="menuitem" class="menu-item w-full text-accent" @click="signOut">
            <Icon name="lucide:log-out" size="16" aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
const auth = useAuthStore();
const localePath = useLocalePath();
const toast = useToast();

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

const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);
const menu = ref<HTMLElement | null>(null);
const open = ref(false);

const items = () =>
  Array.from(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

const toggle = async () => {
  open.value = !open.value;
  if (open.value) {
    await nextTick();
    items()[0]?.focus();
  }
};

const close = (restoreFocus = false) => {
  open.value = false;
  if (restoreFocus) trigger.value?.focus();
};

onClickOutside(root, () => close());

// Arrow keys, Home and End move through the items, as a menu should.
const onKey = (e: KeyboardEvent) => {
  const list = items();
  const at = list.indexOf(document.activeElement as HTMLElement);
  const next = {
    ArrowDown: (at + 1) % list.length,
    ArrowUp: (at - 1 + list.length) % list.length,
    Home: 0,
    End: list.length - 1,
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  list[next]?.focus();
};

const signOut = async () => {
  close();
  auth.logout();
  toast.success("Signed out");
  await navigateTo(localePath("/auth"));
};
</script>
