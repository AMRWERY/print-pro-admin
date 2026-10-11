<template>
  <nav aria-label="Breadcrumb">
    <ol
      class="flex flex-wrap items-center gap-2 meta tracking-wider"
    >
      <template v-for="(item, i) in items" :key="`${item.label}-${i}`">
        <li v-if="i > 0" aria-hidden="true">/</li>
        <li>
          <nuxt-link-locale
            v-if="item.to && i < items.length - 1"
            :to="item.to"
            class="transition-colors duration-200 hover:text-paper"
          >
            {{ item.label }}
          </nuxt-link-locale>
          <span
            v-else
            :aria-current="i === items.length - 1 ? 'page' : undefined"
            :class="i === items.length - 1 && 'text-accent'"
          >
            {{ item.label }}
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
// Trail of links ending in the current page:
//   <LazyVBreadcrumb :items="[{ label: 'Catalog', to: '/' }, { label: 'Search' }]" />
// The last item is always the current page (accent colour, not a link).
// `to` is locale-aware, so pass plain paths like "/products".

import type { BreadcrumbItem } from "~/types/VBreadcrumb";

defineProps<{ items: BreadcrumbItem[] }>();
</script>