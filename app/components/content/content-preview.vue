<template>
  <figure
    class="mx-auto overflow-hidden rounded-card border border-line bg-ink shadow-sm transition-[width] duration-large motion-reduce:transition-none"
    :style="{ width: thumb ? '100%' : deviceMeta[device].width }"
  >
    <div
      class="relative isolate w-full overflow-hidden text-white"
      :style="{
        aspectRatio: ratio,
        containerType: 'inline-size',
        background: `linear-gradient(135deg, ${art.from}, ${art.to})`,
      }"
    >
      <img
        v-if="showImage"
        :src="block.imageUrl"
        :alt="block.imageAlt"
        class="absolute inset-0 -z-10 h-full w-full object-cover"
        loading="lazy"
        @error="broken = true"
      />

      <!-- Artwork when there is no picture -->
      <Icon
        v-else
        :name="kindMeta[block.kind].icon"
        class="absolute -bottom-[8cqw] end-[4cqw] -z-10 opacity-20"
        style="width: 38cqw; height: 38cqw"
        aria-hidden="true"
      />

      <div
        class="absolute inset-0 -z-[5] bg-gradient-to-t from-black/75 via-black/25 to-transparent rtl:bg-gradient-to-t"
        aria-hidden="true"
      />

      <div
        class="flex h-full flex-col justify-end"
        :style="{
          padding: thumb ? '6cqw' : '5cqw',
          gap: thumb ? '1.5cqw' : '1.4cqw',
        }"
      >
        <p
          v-if="!thumb"
          class="font-mono uppercase tracking-widest text-white/80"
          style="font-size: clamp(7px, 1.9cqw, 12px)"
        >
          {{ kindMeta[block.kind].slot }}
        </p>
        <p
          class="line-clamp-2 font-display font-bold leading-tight"
          :style="{ fontSize: thumb ? 'clamp(9px, 7cqw, 15px)' : titleSize }"
        >
          {{ block.title || "Headline goes here" }}
        </p>
        <p
          v-if="!thumb && block.subtitle && showSub"
          class="line-clamp-2 max-w-[80%] text-white/85"
          style="font-size: clamp(8px, 2.3cqw, 15px)"
        >
          {{ block.subtitle }}
        </p>
        <span
          v-if="!thumb && block.ctaLabel"
          class="mt-[0.6cqw] inline-flex w-fit items-center rounded-control bg-accent font-semibold text-onaccent"
          style="font-size: clamp(8px, 2.2cqw, 14px); padding: 1.1cqw 2.6cqw"
        >
          {{ block.ctaLabel }}
        </span>
      </div>
    </div>

    <figcaption v-if="caption" class="sr-only">{{ caption }}</figcaption>
  </figure>
</template>

<script lang="ts" setup>
import { deviceMeta, kindMeta, paletteMeta } from "~/data/content-meta";
import type {
  BlockKind,
  BlockPalette,
  ContentBlock,
  PreviewDevice,
} from "~/types/admin/content";

const props = withDefaults(
  defineProps<{
    block: Pick<
      ContentBlock,
      | "kind"
      | "title"
      | "subtitle"
      | "ctaLabel"
      | "imageUrl"
      | "imageAlt"
      | "palette"
    >;
    device?: PreviewDevice;
    /** Small version for list rows and cards: headline only, fills its parent. */
    thumb?: boolean;
    caption?: string;
  }>(),
  { device: "desktop" },
);

// Phones and tablets get taller crops, the way the storefront recomposes the block.
const ratios: Record<BlockKind, Record<PreviewDevice, string>> = {
  hero: { desktop: "16 / 7", tablet: "4 / 3", mobile: "4 / 5" },
  promo: { desktop: "21 / 6", tablet: "16 / 6", mobile: "16 / 8" },
  category: { desktop: "1 / 1", tablet: "1 / 1", mobile: "1 / 1" },
  product: { desktop: "4 / 3", tablet: "4 / 3", mobile: "1 / 1" },
  brand: { desktop: "3 / 2", tablet: "3 / 2", mobile: "4 / 5" },
  marquee: { desktop: "32 / 9", tablet: "21 / 8", mobile: "16 / 9" },
};

const ratio = computed(() =>
  props.thumb
    ? kindMeta[props.block.kind].ratio
    : ratios[props.block.kind][props.device],
);

const art = computed(() => paletteMeta[props.block.palette as BlockPalette]);

// A picture that fails to load falls back to the artwork.
const broken = ref(false);

watch(
  () => props.block.imageUrl,
  () => {
    broken.value = false;
  },
);

const showImage = computed(() => !!props.block.imageUrl && !broken.value);

const titleSize = computed(() =>
  ["category", "product"].includes(props.block.kind)
    ? "clamp(11px, 7cqw, 26px)"
    : "clamp(11px, 4.4cqw, 34px)",
);

const showSub = computed(() => !["category"].includes(props.block.kind));
</script>