<template>
  <VPanel
    title="Recent orders"
    subtitle="Latest orders and where they are in dispatch"
    icon="lucide:receipt-text"
    body-class=""
  >
    <template #actions>
      <LazyVButton variant="tertiary" size="sm" to="/orders" icon-end="lucide:arrow-up-right" icon-end-class="rtl:-scale-x-100">All orders</LazyVButton>
    </template>

    <div v-if="!data" class="space-y-3 p-4 sm:p-5" aria-busy="true">
      <LazyVSkeletonLoader v-for="n in 5" :key="n" class="h-14" />
    </div>

    <template v-else>
      <!-- Stacked cards on mobile, a real table from md. -->
      <div class="overflow-x-auto">
      <table class="block w-full text-sm md:table">
        <caption class="sr-only">Live stream of verified studio transactions awaiting dispatch or settlement</caption>
        <thead class="hidden md:table-header-group">
          <tr class="border-y border-line bg-ink">
            <th scope="col" class="label-caps px-5 py-2.5 text-start font-normal">Requisition ID</th>
            <th scope="col" class="label-caps px-3 py-2.5 text-start font-normal">Client atelier</th>
            <th scope="col" class="label-caps hidden px-3 py-2.5 text-start font-normal 2xl:table-cell">Allocated equipment</th>
            <th scope="col" class="label-caps px-3 py-2.5 text-end font-normal">Settlement</th>
            <th scope="col" class="label-caps px-3 py-2.5 text-start font-normal">Custody stage</th>
            <th scope="col" class="px-5 py-2.5"><span class="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody class="block divide-y divide-line md:table-row-group">
          <tr
            v-for="row in data.rows"
            :key="row.id"
            class="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-fast hover:bg-raised/60 md:table-row md:p-0"
          >
            <td class="font-mono text-xs text-accent md:table-cell md:px-5 md:py-3" dir="ltr">{{ row.id }}</td>
            <td class="col-span-2 row-start-2 md:table-cell md:px-3 md:py-3">
              <p class="font-medium">{{ row.client }}</p>
              <p class="meta">{{ row.location }}</p>
            </td>
            <td class="col-span-2 row-start-3 text-xs text-mute md:hidden md:px-3 md:py-3 2xl:table-cell">{{ row.allocation }}</td>
            <td class="row-start-1 justify-self-end font-mono text-sm font-semibold tabular-nums md:table-cell md:px-3 md:py-3 md:text-end">{{ currency(row.amount) }}</td>
            <td class="col-span-2 row-start-4 md:table-cell md:px-3 md:py-3">
              <VStatusBadge :tone="status[row.status].tone" :icon="status[row.status].icon">{{ statusText[row.status] }}</VStatusBadge>
            </td>
            <td class="col-span-2 row-start-5 md:table-cell md:px-5 md:py-3 md:text-end">
              <LazyVButton variant="tertiary" size="sm">{{ actionText[row.action] }}<span class="sr-only"> — {{ row.id }}</span></LazyVButton>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <p class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 font-mono text-2xs text-mute sm:px-5">
        <span>Showing {{ data.rows.length }} of {{ number(data.total) }} pending orders</span>
      </p>
    </template>
  </VPanel>
</template>

<script lang="ts" setup>
import type { DashboardSummary, OrderStatus, Tone } from "~/types/admin/dashboard";

const statusText: Record<string, string> = {
  qaPending: "QA pending",
  armoredTransit: "Armored courier",
  escrowSettled: "Escrow settled",
  inProduction: "In production",
  cleanroomQa: "Cleanroom QA",
};

const actionText: Record<string, string> = {
  releaseEscrow: "Release escrow",
  printWaybill: "Print waybill",
  viewDossier: "View dossier",
  auditBatch: "Audit batch",
};


defineProps<{ data?: DashboardSummary["orders"] | null }>();

const { number, currency, percent } = useFormatters();

const status: Record<OrderStatus, { tone: Tone; icon: string }> = {
  qaPending: { tone: "warning", icon: "lucide:clock" },
  armoredTransit: { tone: "info", icon: "lucide:truck" },
  escrowSettled: { tone: "success", icon: "lucide:shield-check" },
  inProduction: { tone: "neutral", icon: "lucide:printer" },
  cleanroomQa: { tone: "accent", icon: "lucide:microscope" },
};
</script>
