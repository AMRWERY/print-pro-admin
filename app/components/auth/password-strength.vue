<template>
  <div class="space-y-3" aria-live="polite">
    <div class="space-y-1.5">
      <div
        class="flex gap-1.5"
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin="0"
        aria-valuemax="4"
        :aria-valuenow="score"
      >
        <span
          v-for="n in 4"
          :key="n"
          class="h-1.5 flex-1 rounded-full transition-colors duration-300"
          :class="n <= score ? bar : 'bg-raised'"
        />
      </div>
      <p class="meta">
        Strength: <span :class="text">{{ label }}</span>
      </p>
    </div>

    <ul
      class="grid gap-x-4 gap-y-1.5 rounded-card border border-line bg-raised p-3 text-sm sm:grid-cols-2"
      aria-label="Password requirements"
    >
      <li
        v-for="c in checks"
        :key="c.key"
        class="flex items-center gap-2"
        :class="c.passed ? 'text-paper' : 'text-mute'"
      >
        <Icon
          :name="c.passed ? 'lucide:circle-check' : 'lucide:circle'"
          size="14"
          :class="c.passed && 'text-success'"
          aria-hidden="true"
        />
        {{ c.label }}
        <span class="sr-only">{{ c.passed ? "(met)" : "(not met)" }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ password: string }>();

const checks = computed(() => passwordChecks(props.password));

const score = computed(() => checks.value.filter((c) => c.passed).length);

// Words and colour together, never colour alone.
const label = computed(() =>
  props.password
    ? ["Weak", "Weak", "Fair", "Good", "Strong"][score.value]
    : "Not entered",
);

const bar = computed(() =>
  score.value <= 1
    ? "bg-accent"
    : score.value <= 3
      ? "bg-yellow"
      : "bg-success",
);

const text = computed(() =>
  score.value <= 1
    ? "text-accent"
    : score.value <= 3
      ? "text-yellow"
      : "text-success",
);
</script>