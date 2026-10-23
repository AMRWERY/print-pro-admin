<template>
  <LazyVPanel
    title="Order progress"
    subtitle="ISO 14644-1 class 4 protocol"
    icon="lucide:link-2"
  >
    <ol class="grid gap-2 md:grid-cols-5">
      <li
        v-for="(phase, i) in phases"
        :key="phase.stage"
        class="flex flex-col gap-1.5 rounded-card border p-3"
        :class="phaseClass[phase.state]"
        :aria-current="phase.state === 'active' ? 'step' : undefined"
      >
        <p
          class="flex items-center justify-between gap-2 font-mono text-2xs uppercase"
        >
          <span>Phase {{ String(i + 1).padStart(2, "0") }}</span>
          <Icon
            :name="phaseIcon[phase.state]"
            size="14"
            :class="iconClass[phase.state]"
            aria-hidden="true"
          />
          <span class="sr-only">{{ stateLabel[phase.state] }}</span>
        </p>
        <p class="text-sm font-semibold leading-snug">{{ phase.title }}</p>

        <LazyVStatusBadge
          v-if="phase.state === 'active'"
          class="self-start"
          tone="accent"
          >Active</LazyVStatusBadge
        >

        <p class="meta">{{ phase.detail }}</p>
      </li>
    </ol>

    <form
      class="mt-4 flex flex-wrap items-end gap-3 rounded-card border border-line bg-ink p-3"
      @submit.prevent="emit('override', target)"
    >
      <LazyVSelectInput
        v-model="target"
        name="stageOverride"
        label="Move to stage"
        class="min-w-0 flex-1 basis-64"
        :options="options"
      />

      <LazyVButton
        type="submit"
        variant="secondary"
        :loading="busy"
        :disabled="target === current"
        >Apply override</LazyVButton
      >
    </form>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { OrderPhase, OrderStage, PhaseState } from "~/types/admin/orders";

const props = defineProps<{
  phases: OrderPhase[];
  current: OrderStage;
  busy?: boolean;
}>();
const emit = defineEmits<{ override: [stage: OrderStage] }>();

const target = ref<OrderStage>(props.current);
// Follow the order when it moves (after an override or a release).
watch(
  () => props.current,
  (stage) => (target.value = stage),
);

const options = computed(() =>
  props.phases.map((p, i) => ({
    value: p.stage,
    label: `Stage ${i + 1}: ${p.title}${p.stage === props.current ? " (current)" : ""}`,
  })),
);

const phaseClass: Record<PhaseState, string> = {
  done: "border-success/30 bg-ink",
  active: "border-accent bg-accent-soft",
  pending: "border-line bg-ink text-mute",
};

const phaseIcon: Record<PhaseState, string> = {
  done: "lucide:circle-check",
  active: "lucide:loader-circle",
  pending: "lucide:lock",
};

const iconClass: Record<PhaseState, string> = {
  done: "text-success",
  active: "text-accent",
  pending: "text-mute",
};

const stateLabel: Record<PhaseState, string> = {
  done: "Completed",
  active: "In progress",
  pending: "Not started",
};
</script>