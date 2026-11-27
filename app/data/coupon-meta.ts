import type { Tone } from "~/types/admin/dashboard";
import type { CouponSort, CouponState, CouponStatus, CouponTab, CouponTier, CouponType } from "~/types/admin/coupons";

// Labels and tones for the coupons screen (no Tailwind classes, see order-meta.ts).
// Text is read through tr() inside getters so it follows the active language.

export const typeMeta: Record<CouponType, { label: string; short: string; icon: string }> = {
  percentage: {
    get label() { return tr("coupons_ui.type_percentage"); },
    get short() { return tr("coupons_ui.type_percentage_short"); },
    icon: "lucide:percent",
  },
  fixed: {
    get label() { return tr("coupons_ui.type_fixed"); },
    get short() { return tr("coupons_ui.type_fixed_short"); },
    icon: "lucide:banknote",
  },
  freight: {
    get label() { return tr("coupons_ui.type_freight"); },
    get short() { return tr("coupons_ui.type_freight_short"); },
    icon: "lucide:truck",
  },
  serviceCredit: {
    get label() { return tr("coupons_ui.type_service_credit"); },
    get short() { return tr("coupons_ui.type_service_credit"); },
    icon: "lucide:printer",
  },
};

export const typeOptions: { value: "all" | CouponType; label: string }[] = [
  { value: "all", get label() { return tr("coupons_ui.type_all"); } },
  ...(Object.keys(typeMeta) as CouponType[]).map((value) => ({
    value,
    get label() { return typeMeta[value].label; },
  })),
];

export const stateMeta: Record<CouponState, { label: string; tone: Tone; icon: string }> = {
  active: { get label() { return tr("coupons_ui.tab_active"); }, tone: "success", icon: "lucide:circle-check" },
  scheduled: { get label() { return tr("coupons_ui.tab_scheduled"); }, tone: "info", icon: "lucide:calendar-clock" },
  depleted: { get label() { return tr("coupons_ui.tab_depleted"); }, tone: "accent", icon: "lucide:circle-alert" },
  expired: { get label() { return tr("coupons_ui.state_expired"); }, tone: "neutral", icon: "lucide:clock" },
  paused: { get label() { return tr("coupons_ui.state_paused"); }, tone: "warning", icon: "lucide:pause" },
  draft: { get label() { return tr("common_ui.draft"); }, tone: "neutral", icon: "lucide:file-text" },
};

export const tabs: { value: CouponTab; label: string }[] = [
  { value: "all", get label() { return tr("coupons_ui.tab_all"); } },
  { value: "active", get label() { return tr("coupons_ui.tab_active"); } },
  { value: "scheduled", get label() { return tr("coupons_ui.tab_scheduled"); } },
  { value: "depleted", get label() { return tr("dashboard_ui.depleted"); } },
  { value: "expired", get label() { return tr("coupons_ui.tab_expired"); } },
  { value: "draft", get label() { return tr("coupons_ui.tab_draft"); } },
];

export const tierOptions: { value: CouponTier; label: string }[] = [
  { value: "all", get label() { return tr("coupons_ui.tier_all"); } },
  { value: "AAA", get label() { return tr("orders_ui.tier_aaa"); } },
  { value: "AA", get label() { return tr("orders_ui.tier_aa"); } },
  { value: "A", get label() { return tr("orders_ui.tier_a"); } },
];

export const sortOptions: { value: CouponSort; label: string }[] = [
  { value: "recent", get label() { return tr("coupons_ui.sort_recent"); } },
  { value: "expiry", get label() { return tr("coupons_ui.sort_expiry"); } },
  { value: "usage", get label() { return tr("coupons_ui.sort_usage"); } },
  { value: "code", get label() { return tr("coupons_ui.sort_code"); } },
];

export const statusOptions: { value: CouponStatus; label: string }[] = [
  { value: "active", get label() { return tr("coupons_ui.tab_active"); } },
  { value: "paused", get label() { return tr("coupons_ui.state_paused"); } },
  { value: "draft", get label() { return tr("common_ui.draft"); } },
  { value: "archived", get label() { return tr("common_ui.archived"); } },
];

export const perAccountOptions = [
  { value: 1, get label() { return tr("coupons_ui.per_account_one"); } },
  { value: 3, get label() { return tr("coupons_ui.per_account_many", { count: 3 }); } },
  { value: 5, get label() { return tr("coupons_ui.per_account_many", { count: 5 }); } },
  { value: 0, get label() { return tr("coupons_ui.per_account_unlimited"); } },
];

/** Short text for the discount column, for example "15% OFF". */
export const valueLabel = (
  c: { type: CouponType; value: number },
  money: (n: number) => string,
) =>
  c.type === "percentage"
    ? tr("coupons_ui.value_percent_off", { value: c.value })
    : c.type === "freight"
      ? tr("coupons_ui.value_free_freight")
      : tr("coupons_ui.value_flat", { value: money(c.value) });
