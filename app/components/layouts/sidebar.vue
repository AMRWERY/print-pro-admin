<template>
  <div>
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-30 bg-ink/70 backdrop-blur-sm lg:hidden"
        aria-hidden="true"
        @click="close"
      />
    </Transition>

    <aside
      id="admin-nav"
      class="fixed inset-y-0 start-0 z-40 flex w-60 flex-col border-e border-line bg-surface transition-transform duration-normal ease-out lg:translate-x-0"
      :class="
        open
          ? 'translate-x-0'
          : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full'
      "
      :inert="inert ? '' : undefined"
      aria-label="Main navigation"
      @keydown.esc="close"
    >
      <div
        class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-line px-4"
      >
        <LazyVBrandMark />

        <LazyVButton
          ref="closeButton"
          variant="icon"
          size="sm"
          icon="lucide:x"
          class="lg:hidden"
          aria-label="Close navigation"
          @click="close"
        />
      </div>

      <nav
        class="flex-1 space-y-5 overflow-y-auto px-3 py-4"
        aria-label="Main navigation"
      >
        <div v-for="group in adminNav" :key="group.label">
          <p class="label-caps px-2 pb-2">{{ group.label }}</p>
          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.to">
              <nuxt-link-locale
                :to="item.to"
                class="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm text-mute transition duration-fast hover:bg-raised hover:text-paper [&.router-link-exact-active]:bg-accent [&.router-link-exact-active]:font-medium [&.router-link-exact-active]:text-onaccent"
              >
                <Icon :name="item.icon" size="16" aria-hidden="true" />
                <span class="truncate">{{ item.label }}</span>
              </nuxt-link-locale>
            </li>
          </ul>
        </div>
      </nav>

      <div class="shrink-0 border-t border-line p-4">
        <p class="flex items-center gap-2 text-xs font-medium">
          <span class="status-dot" aria-hidden="true" />
          Cleanroom lab A
          <span class="ms-auto font-mono text-success">99.98%</span>
        </p>
        <p class="meta mt-1">
          RH {{ "48.2" }}% · Temp {{ "20.4" }}°C · D50 calibrated
        </p>
      </div>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { adminNav } from "~/data/admin-nav";

/** Fixed rail from `lg`; below that it is a drawer controlled by `open`. */
const open = defineModel<boolean>("open", { default: false });

const route = useRoute();
const isDesktop = useMediaQuery("(min-width: 1024px)");
const mounted = useMounted();

// Keep the closed drawer out of the tab order and the accessibility tree.
const inert = computed(() => mounted.value && !isDesktop.value && !open.value);

const close = () => {
  open.value = false;
};

const closeButton = ref<{ focus: () => void } | null>(null);

watch(() => route.fullPath, close);

watch(open, async (isOpen) => {
  if (!isOpen || isDesktop.value) return;
  await nextTick();
  closeButton.value?.focus();
});

// A drawer on top of the page shouldn't let the page scroll underneath.
const scrollLock = useScrollLock(import.meta.client ? document.body : null);
watch([open, isDesktop], ([isOpen, desktop]) => {
  scrollLock.value = isOpen && !desktop;
});
</script>
