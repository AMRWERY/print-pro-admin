<template>
  <VPanel title="Quick actions" icon="lucide:zap">
    <ul class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <li v-for="action in actions" :key="action.label">
        <LazyVButton
          variant="plain"
          :to="action.to"
          class="group flex h-full min-h-24 flex-col items-center justify-center gap-2 rounded-card border border-line bg-ink p-3 text-center transition duration-normal hover:-translate-y-0.5 hover:border-accent hover:bg-raised motion-reduce:hover:translate-y-0"
        >
          <Icon :name="action.icon" size="22" class="icon-lift text-accent" aria-hidden="true" />
          <span class="text-sm font-medium">{{ action.label }}</span>
        </LazyVButton>
      </li>
    </ul>
  </VPanel>
</template>

<script lang="ts" setup>
const actions = [
  { label: "New order", icon: "lucide:circle-plus", to: "/orders?create=1" },
  { label: "Add product", icon: "lucide:package-plus", to: "/products" },
  { label: "Add customer", icon: "lucide:user-plus", to: "/customers" },
  { label: "Restock inventory", icon: "lucide:warehouse", to: "/inventory" },
];
</script>
