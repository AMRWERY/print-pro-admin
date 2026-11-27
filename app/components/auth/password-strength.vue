<template>
  <div class="space-y-3" aria-live="polite">
    <div class="space-y-1.5">
      <div
        class="flex gap-1.5"
        role="progressbar"
        :aria-label="$t('auth_ui.password_strength')"
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
        {{ $t("auth_ui.strength_label") }} <span :class="text">{{ label }}</span>
      </p>
    </div>

    <ul
      class="grid gap-x-4 gap-y-1.5 rounded-card border border-line bg-raised p-3 text-sm sm:grid-cols-2"
      :aria-label="$t('auth_ui.password_requirements')"
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
        {{ checkLabel(c) }}
        <span class="sr-only">{{ c.passed ? $t("auth_ui.req_met") : $t("auth_ui.req_not_met") }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{ password: string }>();

const { t } = useI18n();

const checks = computed(() => passwordChecks(props.password));

// Labels are keyed by the check's `key` (the rule text itself lives in utils/validators.ts).
const checkLabel = (c: { key: string; label: string }) =>
  c.key === "length"
    ? t("auth_ui.check_length", { n: 12 })
    : c.key === "case"
      ? t("auth_ui.check_case")
      : c.key === "digit"
        ? t("auth_ui.check_digit")
        : c.key === "symbol"
          ? t("auth_ui.check_symbol", { symbols: "!@#$%^&*" })
          : c.label;

const score = computed(() => checks.value.filter((c) => c.passed).length);

// Words and colour together, never colour alone.
const label = computed(() =>
  props.password
    ? [
        t("auth_ui.strength_weak"),
        t("auth_ui.strength_weak"),
        t("auth_ui.strength_fair"),
        t("auth_ui.strength_good"),
        t("auth_ui.strength_strong"),
      ][score.value]
    : t("auth_ui.strength_empty"),
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