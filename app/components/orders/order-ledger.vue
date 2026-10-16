<template>
  <LazyVPanel title="Immutable ledger" icon="lucide:database">
    <template #actions>
      <span class="chip" dir="ltr">{{ chain }}</span>
    </template>

    <ol class="space-y-0">
      <li
        v-for="(event, i) in events"
        :key="`${event.at}-${i}`"
        class="relative flex gap-3 pb-4 last:pb-0"
      >
        <span
          class="relative mt-1.5 flex shrink-0 flex-col items-center"
          aria-hidden="true"
        >
          <span
            class="h-2 w-2 rounded-full"
            :class="i === 0 ? 'bg-accent' : 'bg-mute'"
          />
          <span
            v-if="i < events.length - 1"
            class="absolute top-3 h-[calc(100%+0.25rem)] w-px bg-line"
          />
        </span>
        <div class="min-w-0 text-sm">
          <p>{{ event.text }}</p>
          <p class="meta" dir="ltr">{{ formatUtc(event.at) }}</p>
        </div>
      </li>
    </ol>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { LedgerEvent } from "~/types/admin/orders";

defineProps<{ events: LedgerEvent[]; chain: string }>();
</script>