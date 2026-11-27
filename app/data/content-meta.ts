import type { Tone } from "~/types/admin/dashboard";
import type {
  BlockKind,
  BlockPalette,
  BlockState,
  BlockStatusFilter,
  BlockTab,
  PreviewDevice,
} from "~/types/admin/content";

// Labels, tones and artwork for the content screen (no Tailwind classes, see order-meta.ts).
// Text is read through tr() inside getters so it follows the active language.

export const kindMeta: Record<
  BlockKind,
  {
    label: string;
    short: string;
    slot: string;
    icon: string;
    ratio: string;
    hint: string;
  }
> = {
  hero: {
    get label() { return tr("content_ui.kind_hero"); },
    get short() { return tr("content_ui.kind_hero_short"); },
    get slot() { return tr("content_ui.slot_hero"); },
    icon: "lucide:panels-top-left",
    ratio: "16 / 7",
    get hint() { return tr("content_ui.kind_hero_hint"); },
  },
  promo: {
    get label() { return tr("content_ui.kind_promo"); },
    get short() { return tr("content_ui.kind_promo_short"); },
    get slot() { return tr("content_ui.slot_promo"); },
    icon: "lucide:megaphone",
    ratio: "21 / 6",
    get hint() { return tr("content_ui.kind_promo_hint"); },
  },
  category: {
    get label() { return tr("content_ui.kind_category"); },
    get short() { return tr("content_ui.kind_category_short"); },
    get slot() { return tr("content_ui.slot_category"); },
    icon: "lucide:folder-heart",
    ratio: "1 / 1",
    get hint() { return tr("content_ui.kind_category_hint"); },
  },
  product: {
    get label() { return tr("content_ui.kind_product"); },
    get short() { return tr("content_ui.kind_product_short"); },
    get slot() { return tr("content_ui.slot_product"); },
    icon: "lucide:star",
    ratio: "4 / 3",
    get hint() { return tr("content_ui.kind_product_hint"); },
  },
  brand: {
    get label() { return tr("content_ui.kind_brand"); },
    get short() { return tr("content_ui.kind_brand_short"); },
    get slot() { return tr("content_ui.slot_brand"); },
    icon: "lucide:badge-check",
    ratio: "3 / 2",
    get hint() { return tr("content_ui.kind_brand_hint"); },
  },
  marquee: {
    get label() { return tr("content_ui.kind_marquee"); },
    get short() { return tr("content_ui.kind_marquee_short"); },
    get slot() { return tr("content_ui.slot_marquee"); },
    icon: "lucide:text-select",
    ratio: "32 / 9",
    get hint() { return tr("content_ui.kind_marquee_hint"); },
  },
};

export const kindOptions = (Object.keys(kindMeta) as BlockKind[]).map(
  (value) => ({
    value,
    get label() { return kindMeta[value].label; },
  }),
);

export const tabs: { value: BlockTab; label: string }[] = [
  { value: "all", get label() { return tr("content_ui.tab_all"); } },
  ...(Object.keys(kindMeta) as BlockKind[]).map((value) => ({
    value,
    get label() { return kindMeta[value].short; },
  })),
];

export const stateMeta: Record<
  BlockState,
  { label: string; tone: Tone; icon: string }
> = {
  live: { get label() { return tr("content_ui.state_live"); }, tone: "success", icon: "lucide:circle-check" },
  scheduled: {
    get label() { return tr("coupons_ui.tab_scheduled"); },
    tone: "warning",
    icon: "lucide:calendar-clock",
  },
  expired: { get label() { return tr("content_ui.state_expired"); }, tone: "neutral", icon: "lucide:clock" },
  draft: { get label() { return tr("common_ui.draft"); }, tone: "neutral", icon: "lucide:file-text" },
};

export const stateOptions: { value: BlockStatusFilter; label: string }[] = [
  { value: "all", get label() { return tr("products_ui.status_all"); } },
  { value: "live", get label() { return stateMeta.live.label; } },
  { value: "scheduled", get label() { return stateMeta.scheduled.label; } },
  { value: "draft", get label() { return stateMeta.draft.label; } },
  { value: "expired", get label() { return stateMeta.expired.label; } },
];

export const statusChoices = [
  { value: "published", get label() { return tr("content_ui.status_choice_published"); } },
  { value: "draft", get label() { return tr("content_ui.status_choice_draft"); } },
];

/** Artwork shown when a block has no picture. White text stays readable on all of them. */
export const paletteMeta: Record<
  BlockPalette,
  { label: string; from: string; to: string; swatch: string }
> = {
  ember: { get label() { return tr("content_ui.palette_ember"); }, from: "#7f1d1d", to: "#ea580c", swatch: "#dc2626" },
  ocean: { get label() { return tr("content_ui.palette_ocean"); }, from: "#0c4a6e", to: "#0e7490", swatch: "#0284c7" },
  forest: {
    get label() { return tr("content_ui.palette_forest"); },
    from: "#14532d",
    to: "#4d7c0f",
    swatch: "#16a34a",
  },
  graphite: {
    get label() { return tr("content_ui.palette_graphite"); },
    from: "#18181b",
    to: "#52525b",
    swatch: "#3f3f46",
  },
  violet: {
    get label() { return tr("content_ui.palette_violet"); },
    from: "#4c1d95",
    to: "#a21caf",
    swatch: "#7c3aed",
  },
  sand: { get label() { return tr("content_ui.palette_sand"); }, from: "#78350f", to: "#b45309", swatch: "#d97706" },
};

export const paletteOptions = (Object.keys(paletteMeta) as BlockPalette[]).map(
  (value) => ({
    value,
    get label() { return paletteMeta[value].label; },
  }),
);

export const deviceMeta: Record<
  PreviewDevice,
  { label: string; icon: string; width: string; px: number }
> = {
  desktop: {
    get label() { return tr("content_ui.device_desktop"); },
    icon: "lucide:monitor",
    width: "100%",
    px: 1280,
  },
  tablet: { get label() { return tr("content_ui.device_tablet"); }, icon: "lucide:tablet", width: "70%", px: 768 },
  mobile: { get label() { return tr("content_ui.device_mobile"); }, icon: "lucide:smartphone", width: "38%", px: 390 },
};

export const deviceOptions = (Object.keys(deviceMeta) as PreviewDevice[]).map(
  (value) => ({
    value,
    get label() { return deviceMeta[value].label; },
  }),
);

/** Short date such as "Oct 15, 2025", in the active language (Latin digits). */
export const dayLabel = (iso: string) => {
  const active = String(tryUseNuxtApp()?.$i18n?.locale ?? "en");
  const locale = active.startsWith("ar") ? "ar-EG-u-nu-latn" : "en-US";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** "Oct 15 – Nov 30", "From Nov 15", "Until Dec 01" or "Always on". */
export const windowLabel = (startsAt: string | null, endsAt: string | null) => {
  if (startsAt && endsAt) return `${dayLabel(startsAt)} – ${dayLabel(endsAt)}`;
  if (startsAt) return tr("content_ui.window_from", { date: dayLabel(startsAt) });
  if (endsAt) return tr("content_ui.window_until", { date: dayLabel(endsAt) });
  return tr("content_ui.window_always");
};
