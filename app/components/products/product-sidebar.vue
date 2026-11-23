<template>
  <div class="space-y-4">
    <!-- The whole column stays in view while the page scrolls. If it is taller than the screen, it scrolls on its own. -->
    <div class="space-y-8 xl:sticky xl:top-24 xl:z-10 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto xl:overscroll-contain">
      <section class="space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="compatible-machines-supplies-title">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="compatible-machines-supplies-title" class="flex items-center gap-2 font-display text-lg font-bold">
            <Icon name="lucide:link-2" size="18" class="text-accent" aria-hidden="true" />
            Compatible machines & supplies
          </h2>
          <div class="shrink-0"><span class="chip">{{ form.bundled.length }} paired</span></div>
        </header>
      <p v-if="!bundledOptions.length" class="text-sm text-mute">
        No pairable items found.
      </p>
      <ul class="space-y-2">
        <li
          v-for="p in bundledOptions"
          :key="p.id"
          class="rounded-card border border-line bg-ink p-2.5"
        >
          <LazyVCheckboxImput
            v-model="form.bundled"
            :name="`bundle-${p.id}`"
            :value="p.id"
            size="sm"
          >
            <span class="block text-sm font-medium leading-snug">{{
              p.name
            }}</span>
            <span class="meta"
              >{{ currency(p.price, { maximumFractionDigits: 0 }) }} ·
              {{ p.stock }} in stock</span
            >
          </LazyVCheckboxImput>
        </li>
      </ul>
    </section>

    <section class="space-y-4 border-t border-line pt-6 first:border-t-0 first:pt-0" aria-labelledby="change-history-title">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <h2 id="change-history-title" class="flex items-center gap-2 font-display text-lg font-bold">
          <Icon name="lucide:history" size="18" class="text-accent" aria-hidden="true" />
          Change history
        </h2>
        <div class="shrink-0"><span class="chip">{{ revisions.length }} revisions</span></div>
      </header>
      <ol class="space-y-3">
        <li v-for="(r, i) in revisions" :key="r.rev" class="text-sm">
          <p class="flex flex-wrap items-center gap-2 font-mono text-xs">
            Rev {{ r.rev }}
            <LazyVStatusBadge v-if="i === 0" tone="success"
              >Current</LazyVStatusBadge
            >
          </p>
          <p class="text-mute">{{ r.note }}</p>
          <p class="meta" dir="ltr">{{ formatUtc(r.at) }} · {{ r.by }}</p>
        </li>
      </ol>
    </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Product, ProductFormValues, ProductRevision } from "~/types/admin/products";

defineProps<{
  form: ProductFormValues;
  revisions: ProductRevision[];
  bundledOptions: Product[];
}>();

const { currency } = useFormatters();
</script>
