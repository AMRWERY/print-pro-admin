import type { Tone } from "~/types/admin/dashboard";
import type {
  AnalyticsRange,
  Cohort,
  FunnelStage,
  Granularity,
  RegionRow,
  VelocityStatus,
} from "~/types/admin/analytics";

// Labels and tones for the analytics screen (no Tailwind classes, see order-meta.ts).
// Labels are getters so they are translated when read, in the current language.

/** The language the interface is showing now (for date names). */
const currentLocale = (): string => {
  const l = tryUseNuxtApp()?.$i18n?.locale as unknown;
  const v = l && typeof l === "object" && "value" in (l as object) ? (l as { value: unknown }).value : l;
  return typeof v === "string" && v ? v : "en";
};

export const rangeOptions: { value: AnalyticsRange; label: string }[] = [
  { value: "today", get label() { return tr("common_ui.today"); } },
  { value: "7d", get label() { return tr("analytics_ui.period_7d"); } },
  { value: "30d", get label() { return tr("analytics_ui.period_30d"); } },
  { value: "quarter", get label() { return tr("analytics_ui.period_quarter"); } },
  { value: "ytd", get label() { return tr("analytics_ui.period_ytd"); } },
  { value: "custom", get label() { return tr("analytics_ui.period_custom"); } },
];

export const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "day", get label() { return tr("analytics_ui.granularity_day"); } },
  { value: "week", get label() { return tr("analytics_ui.granularity_week"); } },
  { value: "month", get label() { return tr("analytics_ui.granularity_month"); } },
];

export const cohortLabel: Record<Cohort, string> = {
  get all() { return tr("analytics_ui.cohort_all"); },
  get enterprise() { return tr("analytics_ui.cohort_enterprise"); },
  get business() { return tr("analytics_ui.cohort_business"); },
  get printShop() { return tr("analytics_ui.cohort_print_shop"); },
};

export const cohortNote: Record<Exclude<Cohort, "all">, { name: string; sub: string; yoyLabel: string }> = {
  enterprise: {
    get name() { return tr("analytics_ui.cohort_enterprise"); },
    get sub() { return tr("analytics_ui.cohort_sub_enterprise"); },
    get yoyLabel() { return tr("analytics_ui.yoy_orders"); },
  },
  business: {
    get name() { return tr("analytics_ui.cohort_business"); },
    get sub() { return tr("analytics_ui.cohort_sub_business"); },
    get yoyLabel() { return tr("analytics_ui.yoy_orders"); },
  },
  printShop: {
    get name() { return tr("analytics_ui.cohort_print_shop"); },
    get sub() { return tr("analytics_ui.cohort_sub_print_shop"); },
    get yoyLabel() { return tr("analytics_ui.yoy_demand"); },
  },
};

export const funnelLabel: Record<FunnelStage["key"], { title: string; hint: string }> = {
  sessions: {
    get title() { return tr("analytics_ui.stage_sessions"); },
    get hint() { return tr("analytics_ui.stage_sessions_hint"); },
  },
  inspections: {
    get title() { return tr("analytics_ui.stage_inspections"); },
    get hint() { return tr("analytics_ui.stage_inspections_hint"); },
  },
  carts: {
    get title() { return tr("analytics_ui.stage_carts"); },
    get hint() { return tr("analytics_ui.stage_carts_hint"); },
  },
  wire: {
    get title() { return tr("analytics_ui.stage_wire"); },
    get hint() { return tr("analytics_ui.stage_wire_hint"); },
  },
  dispatched: {
    get title() { return tr("analytics_ui.stage_dispatched"); },
    get hint() { return tr("analytics_ui.stage_dispatched_hint"); },
  },
};

export const regionLabel: Record<RegionRow["key"], { name: string; sub: string }> = {
  cairo: {
    get name() { return tr("analytics_ui.region_cairo"); },
    get sub() { return tr("analytics_ui.region_sub_cairo"); },
  },
  delta: {
    get name() { return tr("analytics_ui.region_delta"); },
    get sub() { return tr("analytics_ui.region_sub_delta"); },
  },
  gulf: {
    get name() { return tr("analytics_ui.region_gulf"); },
    get sub() { return tr("analytics_ui.region_sub_gulf"); },
  },
  levant: {
    get name() { return tr("analytics_ui.region_levant"); },
    get sub() { return tr("analytics_ui.region_sub_levant"); },
  },
};

export const velocityMeta: Record<VelocityStatus, { label: string; tone: Tone; icon: string }> = {
  restock: { get label() { return tr("analytics_ui.velocity_restock"); }, tone: "accent", icon: "lucide:circle-alert" },
  low: { get label() { return tr("analytics_ui.velocity_low"); }, tone: "warning", icon: "lucide:triangle-alert" },
  optimal: { get label() { return tr("analytics_ui.velocity_optimal"); }, tone: "info", icon: "lucide:circle-check" },
  healthy: { get label() { return tr("analytics_ui.velocity_healthy"); }, tone: "success", icon: "lucide:shield-check" },
};

/** Short axis and tooltip labels for one interval. */
export const pointLabel = (at: string, granularity: string) => {
  if (granularity === "hour") return `${at.slice(11, 13)}:00`;
  const d = new Date(`${at.slice(0, 10)}T00:00:00Z`);
  return granularity === "month"
    ? d.toLocaleDateString(currentLocale(), { month: "short", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString(currentLocale(), { month: "short", day: "numeric", timeZone: "UTC" });
};

export const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(currentLocale(), { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
