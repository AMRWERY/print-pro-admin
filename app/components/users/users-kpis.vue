<template>
  <ul
    class="grid grid-cols-2 gap-3 xl:grid-cols-4"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li v-for="n in 4" :key="n">
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Total admin operators"
          icon="lucide:users-round"
          :value="number(kpis.total)"
          :hint="`${kpis.active} active · ${kpis.idle} idle · ${kpis.suspended} suspended`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Provisioned roles"
          icon="lucide:shield-user"
          :value="pad(kpis.roles)"
          :hint="`${kpis.systemRoles} locked root role · ${kpis.roles - kpis.systemRoles} custom`"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Hardware keys enrolled"
          icon="lucide:key-round"
          :value="percent(kpis.keyPct, 0)"
          :hint="`${kpis.keyed} of ${kpis.total} operators have a key`"
        >
          <LazyVMeter
            :value="kpis.keyPct"
            :tone="kpis.keyPct >= 100 ? 'success' : 'warning'"
            label="Share of operators with a hardware key"
          />
        </LazyVStatCard>
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :tone="kpis.incidents ? 'accent' : 'default'"
          label="Failed sign-ins (24h)"
          icon="lucide:shield-alert"
          :value="pad(kpis.incidents)"
          :hint="`${kpis.sessions} open sessions · ${kpis.suspended} operators locked`"
        />
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { OperatorsResponse } from "~/types/admin/users";

defineProps<{ kpis?: OperatorsResponse["kpis"] | null }>();

const { number, percent } = useFormatters();

const pad = (n: number) => String(n).padStart(2, "0");
</script>