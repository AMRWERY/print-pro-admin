<template>
  <div class="min-h-screen">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-accent focus:px-4 focus:py-2 focus:text-onaccent"
      >Skip to content</a
    >
    <sidebar v-model:open="navOpen" />
    <!-- Outside the sticky header: its backdrop blur would trap a fixed panel inside it. -->
    <notifications-dialog />

    <div class="lg:ps-60">
      <Header @open-nav="navOpen = true" />
      <main
        id="main"
        class="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6 lg:py-6"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
const navOpen = ref(false);
</script>
