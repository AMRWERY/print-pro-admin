<template>
  <ul
    class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
    :aria-busy="!kpis || undefined"
  >
    <template v-if="!kpis">
      <li
        v-for="n in 5"
        :key="n"
        :class="n === 5 && 'col-span-2 md:col-span-1'"
      >
        <LazyVStatCard loading />
      </li>
    </template>

    <template v-else>
      <li>
        <LazyVStatCard
          size="lg"
          label="Master categories"
          icon="lucide:folder-tree"
          :value="pad(kpis.masters)"
          hint="Parent divisions"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Child nodes"
          icon="lucide:list-tree"
          :value="number(kpis.children)"
          hint="Sub-category branches"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          label="Catalogued SKUs"
          icon="lucide:archive"
          :value="number(kpis.skus)"
          hint="Assigned to master categories"
        />
      </li>
      <li>
        <LazyVStatCard
          size="lg"
          :tone="kpis.unpublished ? 'warning' : 'default'"
          label="Not public"
          icon="lucide:eye"
          :value="number(kpis.unpublished)"
          hint="Staging or hidden categories"
        />
      </li>
      <li class="col-span-2 md:col-span-1">
        <LazyVStatCard size="lg" label="Storefront sync" icon="lucide:database">
          <template #value>
            <LazyVStatusBadge tone="success" icon="lucide:circle-check"
              >Live</LazyVStatusBadge
            >
          </template>
          <p class="font-mono text-2xs text-mute" dir="ltr">#a4f2e</p>
        </LazyVStatCard>
      </li>
    </template>
  </ul>
</template>

<script lang="ts" setup>
import type { CategoriesResponse } from "~/types/admin/categories";

defineProps<{ kpis?: CategoriesResponse["kpis"] | null }>();

const { number } = useFormatters();

const pad = (n: number) => String(n).padStart(2, "0");
</script>