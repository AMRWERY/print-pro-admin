<template>
  <form role="search" class="relative w-full" @submit.prevent="submit">
    <LazyVInput
      v-model="query"
      :name="name"
      type="search"
      :label="label"
      hide-label
      icon="lucide:search"
      autocomplete="off"
      :placeholder="placeholder"
      input-class="!pe-4"
    />
  </form>
</template>

<script lang="ts" setup>
/**
 * A search box that sends the typed text to a search page on Enter.
 *
 *   <LazyVSearchInput label="Search orders" placeholder="Search orders…" />
 *
 * Pass `to=""` when there is no search page yet; Enter then only emits `search`.
 */

const props = withDefaults(
  defineProps<{
    /** Accessible name; the label is visually hidden. */
    label?: string;
    placeholder?: string;
    name?: string;
    /** Page that shows the results, given the text as `?q=`. Empty means do not navigate. */
    to?: string;
  }>(),
  {
    label: "Search printers, photocopiers, ink and toner",
    placeholder: "Search printers, photocopiers, ink, toner…",
    name: "headerSearch",
    to: "/search",
  },
);

const emit = defineEmits<{ search: [query: string] }>();

const query = ref("");
const localePath = useLocalePath();

const submit = () => {
  const q = query.value.trim();
  if (!q) return;
  emit("search", q);
  if (props.to) navigateTo(localePath({ path: props.to, query: { q } }));
};
</script>