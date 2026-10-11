<template>
  <VPanel
    :title="$t('dashboard.actions.title')"
    :subtitle="$t('dashboard.actions.subtitle')"
    icon="lucide:gauge"
  >
    <ul class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <li v-for="action in actions" :key="action.key">
        <LazyVButton
          variant="plain"
          :to="action.to"
          class="group flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-card border border-line bg-ink p-3 text-center transition duration-normal hover:-translate-y-0.5 hover:border-accent hover:bg-raised motion-reduce:hover:translate-y-0"
        >
          <Icon :name="action.icon" size="22" class="icon-lift text-accent" aria-hidden="true" />
          <span class="text-sm font-medium">{{ $t(`dashboard.actions.${action.key}.label`) }}</span>
          <span class="meta">{{ $t(`dashboard.actions.${action.key}.hint`) }}</span>
        </LazyVButton>
      </li>
    </ul>
  </VPanel>
</template>

<script lang="ts" setup>
const actions = [
  { key: "gearPo", icon: "lucide:package-plus", to: "/requisitions-escrow" },
  { key: "atelier", icon: "lucide:user-plus", to: "/studio-dossiers" },
  { key: "labRun", icon: "lucide:sliders-horizontal", to: "/print-lab-configurator" },
  { key: "pricing", icon: "lucide:chart-line", to: "/metrology-yield" },
  { key: "audit", icon: "lucide:scan-barcode", to: "/chain-of-custody" },
  { key: "manifest", icon: "lucide:file-check", to: "/system-parameters" },
];
</script>
