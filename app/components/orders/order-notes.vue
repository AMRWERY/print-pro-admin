<template>
  <LazyVPanel title="Internal admin notes" icon="lucide:lock">
    <template #actions>
      <LazyVStatusBadge tone="neutral" icon="lucide:lock"
        >Staff only</LazyVStatusBadge
      >
    </template>

    <ul class="space-y-3">
      <li
        v-for="note in notes"
        :key="note.id"
        class="rounded-card border bg-ink p-3 text-sm"
        :class="note.urgent ? 'border-accent/50' : 'border-line'"
      >
        <p
          class="flex flex-wrap items-center justify-between gap-2 font-mono text-2xs text-accent"
        >
          <span>{{ note.author }}</span>
          <span class="flex items-center gap-2 text-mute">
            <LazyVStatusBadge
              v-if="note.urgent"
              tone="accent"
              icon="lucide:triangle-alert"
              >Urgent</LazyVStatusBadge
            >
            {{ note.ago }}
          </span>
        </p>
        <p class="mt-1 text-mute">{{ note.text }}</p>
      </li>
    </ul>

    <form class="mt-4 space-y-3" novalidate @submit.prevent="submit">
      <LazyVTextarea
        v-model="text"
        name="adminNote"
        label="Append administrative annotation"
        placeholder="Enter bench observation, optical telemetry, or escrow update…"
        rows="3"
        maxlength="600"
        rules="required"
      />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <LazyVCheckboxImput
          v-model="urgent"
          name="urgentPin"
          label="Mark as urgent pin"
          size="sm"
        />

        <LazyVButton
          type="submit"
          variant="secondary"
          size="sm"
          icon="lucide:check"
          :loading="saving"
          >Save note</LazyVButton
        >
      </div>
    </form>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { OrderNote } from "~/types/admin/orders";

defineProps<{ notes: OrderNote[]; saving?: boolean }>();
const emit = defineEmits<{
  add: [payload: { text: string; urgent: boolean }];
}>();

const text = ref("");
const urgent = ref(false);

const { validate, resetForm } = useForm();

const submit = async () => {
  const { valid } = await validate();
  if (!valid) return;
  emit("add", { text: String(text.value).trim(), urgent: urgent.value });
};

// The page clears the form once the note has been saved.
defineExpose({
  reset: () => {
    text.value = "";
    urgent.value = false;
    resetForm();
  },
});
</script>