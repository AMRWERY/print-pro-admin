<template>
  <nuxt-link-locale
    to="/"
    class="flex items-center gap-2.5"
    aria-label="PrintPro — home"
  >
    <span
      class="grid h-9 w-9 place-items-center rounded-control bg-accent text-onaccent"
      aria-hidden="true"
    >
      <Icon name="lucide:aperture" size="22" />
    </span>
    <span class="leading-tight">
      <span class="block font-display text-base font-bold tracking-wide"
        >Print<span class="text-accent">Pro</span></span
      >
      <span class="block meta tracking-widest"
        >Studios &amp; Printworks</span
      >
    </span>
  </nuxt-link-locale>
</template>

<script lang="ts" setup>

</script>