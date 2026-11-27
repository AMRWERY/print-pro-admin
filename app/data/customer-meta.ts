import type { Tone } from "~/types/admin/dashboard";
import type {
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomerTier,
} from "~/types/admin/customers";

// Labels and tones for the customers screen (no Tailwind classes, see order-meta.ts).
// Labels are getters so they are translated when read, not when this file is imported.

export const segmentMeta: Record<CustomerSegment, { tab: string; short: string; tone: Tone }> = {
  enterprise: {
    get tab() { return tr("customers_ui.segment_enterprise"); },
    get short() { return tr("customers_ui.segment_short_enterprise"); },
    tone: "info",
  },
  business: {
    get tab() { return tr("customers_ui.segment_business"); },
    get short() { return tr("customers_ui.segment_short_business"); },
    tone: "neutral",
  },
  printShop: {
    get tab() { return tr("customers_ui.segment_print_shop"); },
    get short() { return tr("customers_ui.segment_short_print_shop"); },
    tone: "neutral",
  },
  home: {
    get tab() { return tr("customers_ui.segment_home"); },
    get short() { return tr("customers_ui.segment_short_home"); },
    tone: "warning",
  },
  highLtv: {
    get tab() { return tr("customers_ui.segment_high_ltv"); },
    get short() { return tr("customers_ui.segment_short_high_ltv"); },
    tone: "success",
  },
};

export const segmentOptions = (Object.keys(segmentMeta) as CustomerSegment[]).map((value) => ({
  value,
  get label() { return segmentMeta[value].tab; },
}));

export const statusMeta: Record<CustomerStatus, { label: string; tone: Tone; icon: string }> = {
  active: { get label() { return tr("customers_ui.status_active"); }, tone: "success", icon: "lucide:circle-check" },
  audit: { get label() { return tr("customers_ui.status_audit"); }, tone: "warning", icon: "lucide:shield-alert" },
  dormant: { get label() { return tr("customers_ui.status_dormant"); }, tone: "neutral", icon: "lucide:clock" },
};

export const statusOptions: { value: "all" | CustomerStatus; label: string }[] = [
  { value: "all", get label() { return tr("customers_ui.status_all"); } },
  ...(Object.keys(statusMeta) as CustomerStatus[]).map((value) => ({
    value,
    get label() { return statusMeta[value].label; },
  })),
];

export const tierMeta: Record<CustomerTier, { label: string; tone: Tone }> = {
  AAA: { get label() { return tr("customers_ui.tier_aaa"); }, tone: "warning" },
  AA: { get label() { return tr("customers_ui.tier_aa"); }, tone: "info" },
  A: { get label() { return tr("customers_ui.tier_a"); }, tone: "neutral" },
};

export const tierOptions = (Object.keys(tierMeta) as CustomerTier[]).map((value) => ({
  value,
  get label() { return tierMeta[value].label; },
}));

export const activityOptions: { value: CustomerActivity; label: string }[] = [
  { value: "all", get label() { return tr("customers_ui.activity_all"); } },
  { value: "7d", get label() { return tr("customers_ui.activity_7d"); } },
  { value: "30d", get label() { return tr("customers_ui.activity_30d"); } },
  { value: "90d", get label() { return tr("customers_ui.activity_90d"); } },
];

export const sortOptions: { value: CustomerSort; label: string }[] = [
  { value: "spend", get label() { return tr("customers_ui.sort_spend"); } },
  { value: "spendLow", get label() { return tr("customers_ui.sort_spend_low"); } },
  { value: "name", get label() { return tr("customers_ui.sort_name"); } },
  { value: "newest", get label() { return tr("customers_ui.sort_newest"); } },
];

export const initialsOf = (name: string) =>
  name
    .replace(/^(dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
