<template>
  <LazyVPanel
    id="variants"
    title="05 // Variants: substrates, finishes & storage"
    icon="lucide:layers"
    class="scroll-mt-24"
  >
    <template #actions>
      <LazyVButton
        v-if="form.axes.length < 2"
        variant="secondary"
        size="sm"
        icon="lucide:plus"
        @click="addAxis"
        >Add option axis</LazyVButton
      >
    </template>

    <p v-if="!form.axes.length" class="callout">
      <Icon
        name="lucide:info"
        size="14"
        class="bullet-icon"
        aria-hidden="true"
      />
      <span
        >This product has a single configuration. Add an option axis (for
        example Finish or Storage) to sell variants.</span
      >
    </p>

    <div class="space-y-4">
      <div
        v-for="(axis, i) in form.axes"
        :key="i"
        class="space-y-3 rounded-card border border-line bg-ink p-4"
      >
        <div class="flex items-end gap-3">
          <label class="min-w-0 flex-1">
            <span class="label-caps">Axis {{ i + 1 }}</span>
            <input
              v-model="axis.name"
              type="text"
              class="field mt-1"
              :aria-label="`Axis ${i + 1} name`"
              maxlength="40"
              placeholder="e.g. Finish"
            />
          </label>
          <LazyVButton
            variant="icon"
            icon="lucide:trash-2"
            :aria-label="`Remove axis ${axis.name || i + 1}`"
            class="hover:!border-accent hover:!text-accent"
            @click="removeAxis(i)"
          />
        </div>

        <LazyVChipsInput
          v-model="axis.values"
          :label="`Values for ${axis.name || `axis ${i + 1}`}`"
          placeholder="Add a value and press Enter"
          :max="6"
        />
      </div>
    </div>

    <div
      v-if="form.variants.length"
      class="mt-4 overflow-x-auto rounded-card border border-line"
    >
      <table class="w-full min-w-[640px] text-sm">
        <caption class="sr-only">
          Variant matrix
        </caption>
        <thead>
          <tr class="border-b border-line bg-ink">
            <th
              scope="col"
              class="label-caps px-3 py-2.5 text-start font-normal"
            >
              Variant
            </th>
            <th
              scope="col"
              class="label-caps px-3 py-2.5 text-start font-normal"
            >
              SKU extension
            </th>
            <th
              scope="col"
              class="label-caps px-3 py-2.5 text-start font-normal"
            >
              Price (EGP)
            </th>
            <th
              scope="col"
              class="label-caps px-3 py-2.5 text-start font-normal"
            >
              Stock
            </th>
            <th
              scope="col"
              class="label-caps px-3 py-2.5 text-start font-normal"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="v in form.variants" :key="v.key">
            <th scope="row" class="px-3 py-2 text-start font-medium">
              {{ v.label }}
            </th>
            <td class="px-3 py-2">
              <input
                v-model="v.skuExt"
                type="text"
                class="field !py-1.5 font-mono uppercase"
                :aria-label="`SKU extension for ${v.label}`"
                maxlength="30"
              />
            </td>
            <td class="px-3 py-2">
              <input
                v-model.number="v.price"
                type="number"
                min="0"
                step="0.01"
                class="field !py-1.5 tabular-nums"
                :aria-label="`Price for ${v.label}`"
              />
            </td>
            <td class="px-3 py-2">
              <input
                v-model.number="v.stock"
                type="number"
                min="0"
                step="1"
                class="field !py-1.5 tabular-nums"
                :aria-label="`Stock for ${v.label}`"
              />
            </td>
            <td class="px-3 py-2">
              <select
                v-model="v.status"
                class="field !py-1.5"
                :aria-label="`Status for ${v.label}`"
              >
                <option value="active">Active</option>
                <option value="preorder">Pre-order</option>
                <option value="hidden">Hidden</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="form.variants.length" class="mt-2 text-xs text-mute">
      {{ form.variants.length }} variant{{
        form.variants.length > 1 ? "s" : ""
      }}
      from the option axes. Existing prices and stock are kept when you change
      an axis.
    </p>
  </LazyVPanel>
</template>

<script lang="ts" setup>
import type { ProductFormValues } from "~/types/admin/products";

const props = defineProps<{ form: ProductFormValues }>();

const addAxis = () => props.form.axes.push({ name: "", values: [] });

const removeAxis = (i: number) => props.form.axes.splice(i, 1);

// The matrix follows the axes; rows that survive keep what was typed into them.
watch(
  () => props.form.axes.map((a) => [a.name.trim(), ...a.values].join("\u0001")),
  () => {
    props.form.variants = buildVariants(
      props.form.axes,
      Number(props.form.price) || 0,
      props.form.variants,
    );
  },
);
</script>