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

export const rangeOptions: { value: AnalyticsRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7D" },
  { value: "30d", label: "Last 30D" },
  { value: "quarter", label: "Q3 2026" },
  { value: "ytd", label: "Year to date" },
  { value: "custom", label: "Custom range" },
];

export const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

export const cohortLabel: Record<Cohort, string> = {
  all: "All cohorts",
  institutional: "Institutional",
  commercial: "Commercial",
  printmaker: "Printmakers",
};

export const cohortNote: Record<Exclude<Cohort, "all">, { name: string; sub: string; yoyLabel: string }> = {
  institutional: { name: "Institutions", sub: "Museum archives", yoyLabel: "requisitions" },
  commercial: { name: "Commercial", sub: "Cine & foundries", yoyLabel: "studio hire" },
  printmaker: { name: "Printmakers", sub: "Ateliers / masters", yoyLabel: "demand" },
};

export const funnelLabel: Record<FunnelStage["key"], { title: string; hint: string }> = {
  sessions: { title: "Studio discovery & sessions", hint: "Visitors reaching the catalog" },
  inspections: { title: "Metrology inspections", hint: "Spec sheets and MTF reports opened" },
  carts: { title: "Cart & escrow allocations", hint: "Requisitions opened with an escrow hold" },
  wire: { title: "Wire verification gate", hint: "Anti-fraud escrow screening" },
  dispatched: { title: "Dispatched requisitions", hint: "Settled and shipped" },
};

export const regionLabel: Record<RegionRow["key"], { name: string; sub: string }> = {
  dach: { name: "DACH central node", sub: "DE / AT / CH" },
  northAmerica: { name: "North America east", sub: "NY / MA / ON" },
  nordic: { name: "Nordic archival nodes", sub: "SE / NO / DK" },
  apac: { name: "Asia-Pacific atelier escrow", sub: "TYO / HKG" },
};

export const velocityMeta: Record<VelocityStatus, { label: string; tone: Tone; icon: string }> = {
  restock: { label: "Restock", tone: "accent", icon: "lucide:circle-alert" },
  low: { label: "Low buffer", tone: "warning", icon: "lucide:triangle-alert" },
  optimal: { label: "Optimal", tone: "info", icon: "lucide:circle-check" },
  healthy: { label: "Healthy", tone: "success", icon: "lucide:shield-check" },
};

/** Short axis and tooltip labels for one interval. */
export const pointLabel = (at: string, granularity: string) => {
  if (granularity === "hour") return `${at.slice(11, 13)}:00`;
  const d = new Date(`${at.slice(0, 10)}T00:00:00Z`);
  return granularity === "month"
    ? d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

export const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
