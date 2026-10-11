<template>
  <VPanel
    :title="$t('dashboard.studios.title')"
    :subtitle="$t('dashboard.studios.subtitle')"
    icon="lucide:contact-round"
  >
    <template #actions>
      <LazyVButton variant="secondary" size="sm" to="/studio-dossiers" icon="lucide:database">{{
        $t("dashboard.studios.registry")
      }}</LazyVButton>
    </template>

    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1" :aria-busy="!items || undefined">
      <template v-if="!items">
        <li v-for="n in 4" :key="n"><LazyVSkeletonLoader class="h-20" /></li>
      </template>

      <li
        v-for="studio in items ?? []"
        :key="studio.name"
        class="flex items-center gap-3 rounded-card border border-line bg-ink p-3 transition duration-fast hover:border-accent/60"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-line bg-raised font-mono text-xs font-bold" aria-hidden="true">{{ studio.initials }}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ studio.name }}</p>
          <p class="meta truncate">{{ studio.location }}</p>
          <p class="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-2xs text-mute">
            <span class="font-semibold text-paper tabular-nums">{{ currency(studio.lifetimeEscrow, { maximumFractionDigits: 0 }) }}</span>
            <span class="text-accent">{{ $t(`dashboard.studios.tier.${studio.tier}`) }}</span>
          </p>
        </div>
      </li>
    </ul>
  </VPanel>
</template>

<script lang="ts" setup>
import type { StudioDossier } from "~/types/admin/dashboard";

defineProps<{ items?: StudioDossier[] | null }>();

const { currency } = useFormatters();
</script>
