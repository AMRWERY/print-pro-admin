<template>
  <div class="space-y-4">
    <LazyVPanel
      title="Movement telemetry"
      subtitle="Immutable audit trail of every stock change"
      icon="lucide:history"
    >
      <template #actions>
        <LazyVButton
          variant="icon"
          size="sm"
          icon="lucide:refresh-cw"
          aria-label="Refresh movements"
          @click="emit('refresh')"
        />
      </template>

      <ul class="space-y-3" :aria-busy="!movements || undefined">
        <template v-if="!movements">
          <li v-for="n in 4" :key="n"><LazyVSkeletonLoader class="h-20" /></li>
        </template>

        <li
          v-for="m in movements ?? []"
          :key="m.id"
          class="rounded-card border border-line bg-ink p-3 text-sm"
        >
          <p class="flex flex-wrap items-center justify-between gap-2">
            <LazyVStatusBadge
              :tone="movementMeta[m.type].tone"
              :icon="movementMeta[m.type].icon"
            >
              {{
                m.qty === null
                  ? ""
                  : `${m.qty > 0 ? "+" : "−"}${Math.abs(m.qty)} `
              }}{{ movementMeta[m.type].label }}
            </LazyVStatusBadge>
            <span class="font-mono text-2xs text-mute" dir="ltr">{{
              formatUtc(m.at)
            }}</span>
          </p>
          <p class="mt-1.5 font-medium leading-snug">{{ m.name }}</p>
          <p class="text-xs text-mute">{{ m.note }}</p>
          <p class="meta mt-1" dir="ltr">{{ m.sku }} · {{ m.actor }}</p>
        </li>

        <li v-if="movements && !movements.length" class="text-sm text-mute">
          No movements recorded yet.
        </li>
      </ul>

      <p
        class="mt-3 flex items-center justify-between gap-2 font-mono text-2xs text-success"
      >
        <span>Sync integrity: 100%</span>
        <LazyVStatusBadge tone="success" icon="lucide:shield-check"
          >Ledger OK</LazyVStatusBadge
        >
      </p>
    </LazyVPanel>

    <LazyVPanel
      title="Airlock metrology"
      subtitle="Live climate sensors"
      icon="lucide:thermometer"
    >
      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
        <li
          v-for="s in sensors"
          :key="s.vault"
          class="rounded-card border border-line bg-ink p-3"
        >
          <p class="label-caps">{{ s.vault }}</p>
          <p class="font-display text-2xl font-bold tabular-nums">
            {{ s.rh }}<span class="text-sm font-medium text-mute"> % RH</span>
          </p>
          <p class="font-mono text-2xs text-success">
            {{ s.temp }} °C · nominal
          </p>
        </li>
      </ul>
      <p class="mt-3 flex items-center gap-2 font-mono text-2xs text-mute">
        <span class="status-dot" aria-hidden="true" />
        ISO 14644-1 class 4 · HEPA filtered
      </p>
    </LazyVPanel>
  </div>
</template>

<script lang="ts" setup>
import { movementMeta } from "~/data/inventory-meta";
import type { Movement } from "~/types/admin/inventory";

defineProps<{ movements?: Movement[] | null }>();

const emit = defineEmits<{ refresh: [] }>();

// Demo readings. A real deployment feeds these from the vault sensors.
const sensors = [
  { vault: "Frankfurt vault A", rh: "45.2", temp: "20.4" },
  { vault: "Zurich optics vault", rh: "42.8", temp: "19.8" },
];
</script>