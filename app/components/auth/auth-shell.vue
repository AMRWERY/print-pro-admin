<template>
  <div class="container-page py-8 lg:py-12">
    <div
      class="mx-auto grid max-w-5xl gap-6"
      :class="$slots.aside && 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'"
    >
      <aside v-if="$slots.aside" class="hidden lg:block">
        <slot name="aside" />
      </aside>
      <div
        class="mx-auto w-full"
        :class="$slots.aside ? 'max-w-xl' : 'max-w-lg'"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>