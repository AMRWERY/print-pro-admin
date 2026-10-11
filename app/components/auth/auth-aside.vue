<template>
  <div
    class="relative flex h-full min-h-[32rem] flex-col justify-between overflow-hidden card p-6"
  >
    <div
      class="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_20%_20%,rgb(var(--c-accent)/0.16),transparent_70%)]"
    />
    <Icon
      :name="icon"
      size="220"
      class="pointer-events-none absolute -bottom-6 -end-8 text-line/60"
      aria-hidden="true"
    />

    <p class="eyebrow relative flex items-center gap-2">
      <span class="pip" aria-hidden="true" />{{ eyebrow }}
    </p>

    <div class="relative space-y-5">
      <div class="space-y-2">
        <p class="eyebrow flex items-center gap-1.5 text-yellow">
          <Icon name="lucide:badge-check" size="14" aria-hidden="true" />{{
            tag
          }}
        </p>
        <h2 class="font-display text-3xl leading-tight">{{ title }}</h2>
        <p v-if="body" class="text-sm text-mute">{{ body }}</p>
      </div>

      <ul v-if="points?.length" class="space-y-2">
        <li
          v-for="p in points"
          :key="p.title"
          class="flex items-start gap-3 rounded-card border border-line bg-ink/60 p-3 backdrop-blur"
        >
          <Icon
            :name="p.icon"
            size="18"
            class="bullet-icon"
            aria-hidden="true"
          />
          <span class="text-sm"
            ><span class="block font-medium">{{ p.title }}</span
            ><span class="text-mute">{{ p.body }}</span></span
          >
        </li>
      </ul>

      <dl
        class="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-line bg-line"
      >
        <div v-for="s in stats" :key="s.label" class="bg-ink/80 p-3">
          <dt class="eyebrow">{{ s.label }}</dt>
          <dd class="mt-1 font-mono text-sm">{{ s.value }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  eyebrow: string;
  tag: string;
  title: string;
  body?: string;
  icon: string;
  points?: { icon: string; title: string; body: string }[];
  stats: { label: string; value: string }[];
}>();
</script>