<template>
  <nav
    v-if="total > 0"
    :aria-label="label"
    class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pt-6"
  >
    <p class="meta" aria-live="polite">
      Displaying
      <span class="text-paper">{{ rangeStart }}–{{ rangeEnd }}</span> of
      <span class="text-paper">{{ total }}</span> {{ itemLabel }}
    </p>

    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div
        class="flex items-center gap-2"
        role="group"
        aria-label="Items per page"
      >
        <span class="eyebrow">Show</span>
        <LazyVButton
          variant="plain"
          v-for="n in perPageOptions"
          :key="n"
          class="h-9 min-w-9 rounded-control border px-2 font-mono text-xs transition duration-200"
          :class="
            perPage === n
              ? 'border-accent text-accent'
              : 'border-line text-mute hover:border-mute hover:text-paper'
          "
          :aria-pressed="perPage === n"
          @click="setPerPage(n)"
        >
          {{ n }}
        </LazyVButton>
      </div>

      <ul class="flex items-center gap-1.5">
        <li>
          <LazyVButton
            variant="secondary"
            class="h-9 !px-3 !py-0 font-mono text-xs"
            :disabled="page <= 1"
            @click="go(page - 1)"
          >
            <Icon
              name="lucide:chevron-left"
              size="14"
              class="icon-nudge rtl:-scale-x-100"
              aria-hidden="true"
            />
            Prev
          </LazyVButton>
        </li>

        <li v-for="(p, i) in pages" :key="`${p}-${i}`">
          <span v-if="p === '…'" class="px-1 text-mute" aria-hidden="true"
            >…</span
          >
          <LazyVButton
            variant="plain"
            v-else
            class="h-9 min-w-9 rounded-control border px-2 font-mono text-xs transition duration-200"
            :class="
              p === page
                ? 'border-accent bg-accent text-onaccent'
                : 'border-line text-mute hover:border-mute hover:text-paper'
            "
            :aria-current="p === page ? 'page' : undefined"
            :aria-label="`Page ${p}`"
            @click="go(p)"
          >
            {{ p }}
          </LazyVButton>
        </li>

        <li>
          <LazyVButton
            variant="secondary"
            class="h-9 !px-3 !py-0 font-mono text-xs"
            :disabled="page >= pageCount"
            @click="go(page + 1)"
          >
            Next
            <Icon
              name="lucide:chevron-right"
              size="14"
              class="icon-nudge rtl:-scale-x-100"
              aria-hidden="true"
            />
          </LazyVButton>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts" setup>
// Generic, v-model driven pagination:
//
//   <LazyVPagination v-model:page="page" v-model:per-page="perPage" :total="84"
//                 show-per-page scroll-to="#results" />
//
// It owns no data. Page numbers collapse to "1 … 4 5 6 … 9" for long ranges.
const props = withDefaults(
  defineProps<{
    page: number;
    perPage: number;
    total: number;
    /** Render the "Show 12 · 24 · 48" selector next to the page buttons. */
    showPerPage?: boolean;
    perPageOptions?: readonly number[];
    /** Neighbours kept on each side of the current page. */
    siblings?: number;
    /** CSS selector to scroll into view after a page change. */
    scrollTo?: string;
    itemLabel?: string;
    label?: string;
  }>(),
  {
    showPerPage: false,
    perPageOptions: () => [12, 24, 48],
    siblings: 1,
    itemLabel: "verified items",
    label: "Pagination",
  },
);

const emit = defineEmits<{
  "update:page": [page: number];
  "update:perPage": [perPage: number];
}>();

const pageCount = computed(() =>
  Math.max(1, Math.ceil(props.total / props.perPage)),
);

const rangeStart = computed(() =>
  props.total ? (props.page - 1) * props.perPage + 1 : 0,
);

const rangeEnd = computed(() =>
  Math.min(props.page * props.perPage, props.total),
);

const pages = computed<(number | "…")[]>(() => {
  const last = pageCount.value;
  const keep = new Set([1, last]);
  for (
    let n = props.page - props.siblings;
    n <= props.page + props.siblings;
    n++
  )
    keep.add(n);
  const nums = [...keep]
    .filter((n) => n >= 1 && n <= last)
    .sort((a, b) => a - b);

  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
});

const go = (n: number | "…") => {
  if (n === "…") return;
  const next = Math.min(Math.max(1, n), pageCount.value);
  if (next === props.page) return;
  emit("update:page", next);
  if (props.scrollTo && import.meta.client)
    document
      .querySelector(props.scrollTo)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const setPerPage = (n: number) => {
  emit("update:perPage", n);
  emit("update:page", 1);
};
</script>