<template>
  <VPanel :title="t('dashboard_ui.quick_actions')" icon="lucide:zap">
    <ul class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <li v-for="action in actions" :key="action.to">
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
const { t } = useI18n();

const actions = computed(() => [
  { label: t("dashboard_ui.qa_new_order"), icon: "lucide:circle-plus", to: "/orders?create=1" },
  { label: t("dashboard_ui.qa_add_product"), icon: "lucide:package-plus", to: "/products" },
  { label: t("dashboard_ui.qa_add_customer"), icon: "lucide:user-plus", to: "/customers" },
  { label: t("dashboard_ui.qa_restock_inventory"), icon: "lucide:warehouse", to: "/inventory" },
]);
</script>
