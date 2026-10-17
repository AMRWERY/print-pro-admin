<template>
  <div :aria-busy="loading || undefined">
    <!-- Ledger on wide screens: a dense, scannable table -->
    <div v-if="view === 'ledger'" class="hidden overflow-x-auto lg:block">
      <table class="w-full min-w-[1000px] text-sm">
        <caption class="sr-only">
          Product register
        </caption>
        <thead>
          <tr class="border-y border-line bg-ink">
            <th scope="col" class="w-10 px-4 py-3">
              <LazyVCheckboxImput
                name="pickAll"
                label="Select all products on this page"
                hide-label
                size="sm"
                :model-value="allSelected"
                :indeterminate="selected.length > 0 && !allSelected"
                :disabled="loading || !rows.length"
                @update:model-value="toggleAll"
              />
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Product / optical node
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              SKU &amp; EAN ref
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Category &amp; make
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-end font-normal">
              Unit price (EGP)
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Stock reserves
            </th>
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Status
            </th>
            <th scope="col" class="px-4 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading" class="divide-y divide-line">
          <tr v-for="n in perPage" :key="n">
            <td class="px-4 py-4">
              <LazyVSkeletonLoader class="h-4 w-4" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-10 w-64" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-9 w-32" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-9 w-32" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="ms-auto h-9 w-24" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-9 w-28" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-6 w-28" />
            </td>
            <td class="px-4 py-4">
              <LazyVSkeletonLoader variant="button" class="w-10" />
            </td>
          </tr>
        </tbody>

        <tbody v-else class="divide-y divide-line">
          <tr
            v-for="p in rows"
            :key="p.id"
            class="align-top transition-colors duration-fast hover:bg-raised/60"
            :class="[
              selected.includes(p.id) && 'bg-accent-soft',
              stockStateOf(p) === 'out' && 'bg-accent-soft/50',
            ]"
          >
            <td class="px-4 py-3.5">
              <LazyVCheckboxImput
                :name="`pick-${p.id}`"
                :label="`Select ${p.name}`"
                hide-label
                size="sm"
                :model-value="selected.includes(p.id)"
                @update:model-value="toggle(p.id)"
              />
            </td>
            <td class="px-3 py-3.5">
              <div class="flex items-start gap-3">
                <LazyVIconTile :icon="p.icon" />

                <div class="min-w-0">
                  <p
                    class="flex flex-wrap items-center gap-2 font-medium leading-snug"
                  >
                    {{ p.name }}
                    <span class="chip">{{ p.tag }}</span>
                  </p>
                  <p class="meta">{{ p.spec }}</p>
                  <p class="meta" dir="ltr">{{ p.serial }}</p>
                </div>
              </div>
            </td>
            <td class="px-3 py-3.5 font-mono text-xs" dir="ltr">
              <p class="font-semibold">{{ p.sku }}</p>
              <p class="text-mute">EAN: {{ p.ean }}</p>
            </td>
            <td class="px-3 py-3.5">
              <p class="flex items-center gap-1.5 text-xs">
                <Icon
                  :name="categoryMeta[p.category].icon"
                  size="14"
                  class="text-accent"
                  aria-hidden="true"
                />{{ categoryMeta[p.category].label }}
              </p>
              <p class="meta mt-0.5">{{ p.brand }}</p>
            </td>
            <td class="px-3 py-3.5 text-end">
              <p class="font-mono text-sm font-semibold tabular-nums">
                {{ currency(p.price, { maximumFractionDigits: 0 }) }}
              </p>
            </td>
            <td class="w-44 px-3 py-3.5">
              <p
                class="flex items-center justify-between gap-2 font-mono text-xs tabular-nums"
              >
                <span
                  >{{ p.stock }} {{ p.unit
                  }}{{ p.stock === 1 ? "" : "s" }}</span
                >
                <span class="text-mute">Min {{ p.min }}</span>
              </p>
              <LazyVMeter
                class="my-1.5"
                :value="(p.stock / (p.min * 4)) * 100"
                :tone="stockMeta[stockStateOf(p)].tone"
                :label="`Stock level for ${p.name}`"
              />

              <LazyVStatusBadge
                :tone="stockMeta[stockStateOf(p)].tone"
                :icon="stockMeta[stockStateOf(p)].icon"
                >{{ stockMeta[stockStateOf(p)].label }}</LazyVStatusBadge
              >
            </td>
            <td class="px-3 py-3.5">
              <LazyVStatusBadge
                :tone="statusMeta[p.status].tone"
                :icon="statusMeta[p.status].icon"
                >{{ statusMeta[p.status].label }}</LazyVStatusBadge
              >
            </td>
            <td class="px-4 py-3.5 text-end">
              <LazyVMenu :label="`Actions for ${p.name}`" width="w-44">
                <template #trigger="{ attrs, toggle: open }">
                  <LazyVButton
                    v-bind="attrs"
                    variant="icon"
                    size="sm"
                    icon="lucide:ellipsis"
                    :aria-label="`Actions for ${p.name}`"
                    @click="open"
                  />
                </template>
                <button
                  type="button"
                  role="menuitem"
                  class="menu-item w-full"
                  @click="emit('edit', p)"
                >
                  <Icon name="lucide:pencil" size="16" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="menu-item w-full"
                  @click="emit('duplicate', p)"
                >
                  <Icon name="lucide:copy" size="16" aria-hidden="true" />
                  Duplicate
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="menu-item w-full text-accent"
                  @click="emit('remove', p)"
                >
                  <Icon name="lucide:trash-2" size="16" aria-hidden="true" />
                  Delete
                </button>
              </LazyVMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards: always in card mode, and the ledger's stand-in below lg -->
    <ul
      :class="[
        'grid gap-3 p-4 sm:p-5 sm:grid-cols-2',
        view === 'cards' ? 'lg:grid-cols-3 2xl:grid-cols-4' : 'lg:hidden',
      ]"
    >
      <template v-if="loading">
        <li v-for="n in Math.min(perPage, 6)" :key="n">
          <LazyVSkeletonLoader class="h-44" />
        </li>
      </template>

      <li v-for="p in loading ? [] : rows" :key="p.id">
        <product-card
          :product="p"
          :selected="selected.includes(p.id)"
          @toggle="toggle(p.id)"
          @edit="emit('edit', p)"
          @duplicate="emit('duplicate', p)"
          @remove="emit('remove', p)"
          @stock="(n) => emit('stock', p, n)"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {
  categoryMeta,
  stockMeta,
  stockStateOf,
  statusMeta,
} from "~/data/product-meta";
import type { Product } from "~/types/admin/products";

const props = defineProps<{
  rows: Product[];
  loading?: boolean;
  perPage: number;
  view: "ledger" | "cards";
}>();

const emit = defineEmits<{
  edit: [p: Product];
  duplicate: [p: Product];
  remove: [p: Product];
  stock: [p: Product, value: number];
}>();

const selected = defineModel<string[]>("selected", { default: () => [] });

const { currency } = useFormatters();

const allSelected = computed(
  () =>
    props.rows.length > 0 &&
    props.rows.every((r) => selected.value.includes(r.id)),
);

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((x) => x !== id)
    : [...selected.value, id];
};

const toggleAll = () => {
  selected.value = allSelected.value ? [] : props.rows.map((r) => r.id);
};
</script>