<template>
  <VPanel
    title="Top performing substrates & hardware"
    subtitle="Fiscal velocity leaders ranked by 30-day turnover and optical pass margin"
    icon="lucide:trending-up"
    body-class=""
  >
    <template v-if="total" #actions>
      <p class="label-caps">Cycle revenue {{ currency(total, { maximumFractionDigits: 0 }) }}</p>
    </template>

    <div v-if="!items" class="space-y-3 p-4 sm:p-5" aria-busy="true">
      <LazyVSkeletonLoader v-for="n in 5" :key="n" class="h-12" />
    </div>

    <template v-else>
      <!-- Wide screens: scannable table -->
      <div class="hidden overflow-x-auto xl:block">
        <table class="w-full text-start text-sm">
          <caption class="sr-only">Fiscal velocity leaders ranked by 30-day turnover and optical pass margin</caption>
          <thead>
            <tr class="border-y border-line bg-ink text-start">
              <th scope="col" class="label-caps px-5 py-2.5 text-start font-normal">Product / instrument</th>
              <th scope="col" class="label-caps px-3 py-2.5 text-start font-normal">Division</th>
              <th scope="col" class="label-caps px-3 py-2.5 text-end font-normal">Unit value</th>
              <th scope="col" class="label-caps px-3 py-2.5 text-end font-normal">Volume sold</th>
              <th scope="col" class="label-caps px-3 py-2.5 text-end font-normal">Gross turnover</th>
              <th scope="col" class="label-caps px-3 py-2.5 text-start font-normal">QA collimation</th>
              <th scope="col" class="px-5 py-2.5"><span class="sr-only">Audit</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <tr v-for="item in items" :key="item.rank" class="transition-colors duration-fast hover:bg-raised/60">
              <td class="px-5 py-3">
                <div class="flex items-center gap-3">
                  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-control border border-line bg-raised text-accent" aria-hidden="true">
                    <Icon :name="item.icon" size="18" />
                  </span>
                  <div class="min-w-0">
                    <p class="truncate font-medium">{{ item.name }}</p>
                    <p class="meta truncate">{{ item.spec }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 text-mute">{{ divisionText[item.division] }}</td>
              <td class="px-3 py-3 text-end font-mono text-xs tabular-nums">{{ currency(item.unitValue) }}</td>
              <td class="px-3 py-3 text-end font-mono text-xs tabular-nums">{{ `${number(item.volume)} ${item.volumeUnit}` }}</td>
              <td class="px-3 py-3 text-end font-mono text-xs font-semibold tabular-nums">{{ currency(item.revenue) }}</td>
              <td class="px-3 py-3"><VStatusBadge tone="success" icon="lucide:file-check">{{ item.qa }}</VStatusBadge></td>
              <td class="px-5 py-3 text-end">
                <LazyVButton variant="tertiary" size="sm" icon-end="lucide:arrow-up-right" icon-end-class="rtl:-scale-x-100">View dossier<span class="sr-only"> — {{ item.name }}</span></LazyVButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tablet / mobile: ranked list -->
      <ol class="divide-y divide-line xl:hidden">
        <li v-for="item in items" :key="item.rank" class="flex items-center gap-3 px-4 py-3 sm:px-5">
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-mute" aria-hidden="true">{{ item.rank }}</span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ item.name }}</p>
            <p class="meta truncate">
              {{ `${number(item.volume)} ${item.volumeUnit}` }} · {{ currency(item.unitValue) }}
            </p>
          </div>
          <p class="shrink-0 text-end font-mono text-sm font-semibold tabular-nums">
            {{ compactCurrency(item.revenue) }}
          </p>
        </li>
      </ol>

      <p class="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 font-mono text-2xs text-mute sm:px-5 xl:hidden">
        <span>Top 5 account for {{ percent(share) }} of gross margin</span>
        <VStatusBadge tone="success" icon="lucide:shield-check">D50 lab verified</VStatusBadge>
      </p>
    </template>
  </VPanel>
</template>

<script lang="ts" setup>
import type { TopProduct } from "~/types/admin/dashboard";

const divisionText: Record<string, string> = {
  mediumFormat: "Medium format",
  piezoEngines: "Piezo engines",
  fineArtMedia: "Fine art media",
  pigmentChemistry: "Pigment chemistry",
};


const props = defineProps<{ items?: TopProduct[] | null; share: number }>();

const { number, currency, compactCurrency, percent } = useFormatters();

const total = computed(() => props.items?.reduce((sum, i) => sum + i.revenue, 0) ?? 0);
</script>
