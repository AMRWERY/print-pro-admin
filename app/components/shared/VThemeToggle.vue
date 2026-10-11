<template>
  <LazyVButton variant="icon"
    class="overflow-hidden"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    @click="toggle"
  >
    <Transition name="icon-swap" mode="out-in">
      <Icon
        :key="theme"
        :name="isDark ? 'lucide:sun' : 'lucide:moon'"
        size="18"
        aria-hidden="true"
      />
    </Transition>
  </LazyVButton>
</template>

<script lang="ts" setup>
const { theme, toggle } = useTheme();

const isDark = computed(() => theme.value === "dark");
</script>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    transform 0.2s ease-out,
    opacity 0.2s ease-out;
}
.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}
.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
