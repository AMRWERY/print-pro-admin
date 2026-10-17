<template>
  <div :aria-busy="loading || undefined">
    <!-- Wide screens: ledger table. It fits its column, so there is no sideways scrolling. -->
    <div class="hidden lg:block">
      <table class="w-full text-sm">
        <caption class="sr-only">
          Inventory ledger
        </caption>
        <thead>
          <tr class="border-y border-line bg-ink">
            <th scope="col" class="label-caps px-3 py-3 text-start font-normal">
              Apparatus / substrate
            </th>
            <th
              scope="col"
              class="label-caps px-2.5 py-3 text-start font-normal"
            >
              SKU &amp; bin
            </th>
            <th
              scope="col"
              class="label-caps px-2.5 py-3 text-start font-normal"
            >
              Stock
            </th>
            <th scope="col" class="label-caps px-2.5 py-3 text-end font-normal">
              Value
            </th>
            <th scope="col" class="px-3 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading" class="divide-y divide-line">
          <tr v-for="n in perPage" :key="n">
            <td class="px-3 py-4">
              <LazyVSkeletonLoader class="h-10 w-full" />
            </td>
            <td class="px-2.5 py-4">
              <LazyVSkeletonLoader class="h-10 w-28" />
            </td>
            <td class="px-2.5 py-4">
              <LazyVSkeletonLoader class="h-10 w-28" />
            </td>
            <td class="px-2.5 py-4">
              <LazyVSkeletonLoader class="ms-auto h-6 w-16" />
            </td>
            <td class="px-3 py-4">
              <LazyVSkeletonLoader variant="button" class="w-24" />
            </td>
          </tr>
        </tbody>

        <tbody v-else class="divide-y divide-line">
          <tr
            v-for="i in rows"
            :key="i.id"
            class="align-top transition-colors duration-fast hover:bg-raised/60"
          >
            <td class="px-3 py-3.5">
              <div class="flex items-start gap-3">
                <LazyVIconTile :icon="i.icon" />
                <div class="min-w-0">
                  <p class="font-medium leading-snug">{{ i.name }}</p>
                  <p class="meta">{{ i.spec }}</p>
                  <p class="meta">{{ i.brand }}</p>
                </div>
              </div>
            </td>
            <td class="px-2.5 py-3.5 font-mono text-xs" dir="ltr">
              <p class="font-semibold">{{ i.sku }}</p>
              <p class="text-mute">{{ i.vault }}</p>
              <p class="text-mute">{{ i.bin }}</p>
            </td>
            <td class="w-36 px-2.5 py-3.5">
              <p
                class="flex items-baseline justify-between gap-2 font-mono tabular-nums"
              >
                <span class="text-base font-semibold">{{
                  number(i.stock)
                }}</span>
                <span class="text-2xs text-mute">Min {{ i.min }}</span>
              </p>
              <LazyVMeter
                class="my-1.5"
                :value="(i.stock / (Math.max(i.min, 1) * 4)) * 100"
                :tone="stockMeta[i.state].tone"
                :label="`Stock level for ${i.name}`"
              />
              <p class="meta">
                {{ i.reserved }} reserved · {{ i.available }} free
              </p>
              <LazyVStatusBadge
                v-if="i.state !== 'ok'"
                class="mt-1.5"
                :tone="stockMeta[i.state].tone"
                :icon="stockMeta[i.state].icon"
                >{{ stockMeta[i.state].label }}</LazyVStatusBadge
              >
            </td>
            <td
              class="px-2.5 py-3.5 text-end font-mono text-sm font-semibold tabular-nums"
            >
              {{
                currency(i.price * i.stock, {
                  maximumFractionDigits: 0,
                  notation: "compact",
                })
              }}
            </td>
            <td class="px-3 py-3.5">
              <div class="flex justify-end">
                <LazyVRowActions
                  :label="`Actions for ${i.name}`"
                  duplicate
                  @edit="emit('edit', i)"
                  @duplicate="emit('duplicate', i)"
                  @remove="emit('remove', i)"
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="menu-item w-full"
                    @click="emit('adjust', i)"
                  >
                    <Icon
                      name="lucide:sliders-horizontal"
                      size="16"
                      aria-hidden="true"
                    />
                    Adjust stock
                  </button>
                </LazyVRowActions>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tablet and mobile: cards -->
    <ul class="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:hidden">
      <template v-if="loading">
        <li v-for="n in Math.min(perPage, 6)" :key="n">
          <LazyVSkeletonLoader class="h-44" />
        </li>
      </template>
      <li
        v-for="i in loading ? [] : rows"
        :key="i.id"
        class="flex flex-col gap-3 rounded-card border border-line bg-surface p-3"
      >
        <div class="flex items-start gap-3">
          <LazyVIconTile :icon="i.icon" />

          <div class="min-w-0 flex-1">
            <p class="font-mono text-2xs text-mute" dir="ltr">
              {{ i.sku }} · {{ i.vault }} {{ i.bin }}
            </p>
            <h3 class="font-display text-base font-bold leading-snug">
              {{ i.name }}
            </h3>
            <p class="meta">{{ i.brand }}</p>
          </div>
        </div>
        <div>
          <p class="flex items-baseline justify-between font-mono tabular-nums">
            <span class="text-lg font-semibold"
              >{{ number(i.stock) }}
              <span class="text-xs font-normal text-mute"
                >{{ i.unit }}s</span
              ></span
            >
            <span class="text-2xs text-mute"
              >Min {{ i.min }} · {{ i.available }} free</span
            >
          </p>
          <LazyVMeter
            class="mt-1.5"
            :value="(i.stock / (Math.max(i.min, 1) * 4)) * 100"
            :tone="stockMeta[i.state].tone"
            :label="`Stock level for ${i.name}`"
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <LazyVStatusBadge
            v-if="i.state !== 'ok'"
            :tone="stockMeta[i.state].tone"
            :icon="stockMeta[i.state].icon"
            >{{ stockMeta[i.state].label }}</LazyVStatusBadge
          >

          <LazyVRowActions
            class="ms-auto"
            :label="`Actions for ${i.name}`"
            duplicate
            @edit="emit('edit', i)"
            @duplicate="emit('duplicate', i)"
            @remove="emit('remove', i)"
          >
            <button
              type="button"
              role="menuitem"
              class="menu-item w-full"
              @click="emit('adjust', i)"
            >
              <Icon
                name="lucide:sliders-horizontal"
                size="16"
                aria-hidden="true"
              />
              Adjust stock
            </button>
          </LazyVRowActions>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { stockMeta } from "~/data/product-meta";
import type { InventoryItem } from "~/types/admin/inventory";

defineProps<{ rows: InventoryItem[]; loading?: boolean; perPage: number }>();

const emit = defineEmits<{
  adjust: [item: InventoryItem];
  edit: [item: InventoryItem];
  duplicate: [item: InventoryItem];
  remove: [item: InventoryItem];
}>();

const { number, currency } = useFormatters();
</script>