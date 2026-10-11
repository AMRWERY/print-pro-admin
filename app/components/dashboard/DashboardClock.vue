<template>
  <time :datetime="iso" class="tabular-nums" dir="ltr">{{ label }}</time>
</template>

<script lang="ts" setup>
// Client-only ticking clock: the server has no "now" that would match the browser's.
const now = ref<Date | null>(null);

onMounted(() => {
  now.value = new Date();
});
useIntervalFn(() => {
  now.value = new Date();
}, 1000);

const iso = computed(() => now.value?.toISOString() ?? "");
const label = computed(() =>
  now.value ? `UTC ${now.value.toISOString().slice(11, 19)}` : "UTC --:--:--",
);
</script>
