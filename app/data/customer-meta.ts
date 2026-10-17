import type { Tone } from "~/types/admin/dashboard";
import type {
  CustomerActivity,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomerTier,
} from "~/types/admin/customers";

// Labels and tones for the customers screen (no Tailwind classes, see order-meta.ts).

export const segmentMeta: Record<CustomerSegment, { tab: string; short: string; tone: Tone }> = {
  institutional: { tab: "Institutional museums & archival", short: "Institutional", tone: "info" },
  commercial: { tab: "Commercial studios & foundries", short: "Commercial", tone: "neutral" },
  printmaker: { tab: "Master printmakers & ateliers", short: "Printmaker", tone: "neutral" },
  collector: { tab: "VIP private collectors", short: "Collector", tone: "warning" },
  highLtv: { tab: "High value (over 50k)", short: "High value", tone: "success" },
};

export const segmentOptions = (Object.keys(segmentMeta) as CustomerSegment[]).map((value) => ({
  value,
  label: segmentMeta[value].tab,
}));

export const statusMeta: Record<CustomerStatus, { label: string; tone: Tone; icon: string }> = {
  active: { label: "Active", tone: "success", icon: "lucide:circle-check" },
  audit: { label: "In audit", tone: "warning", icon: "lucide:shield-alert" },
  dormant: { label: "Dormant", tone: "neutral", icon: "lucide:clock" },
};

export const statusOptions: { value: "all" | CustomerStatus; label: string }[] = [
  { value: "all", label: "Status: all" },
  ...(Object.keys(statusMeta) as CustomerStatus[]).map((value) => ({ value, label: statusMeta[value].label })),
];

export const tierMeta: Record<CustomerTier, { label: string; tone: Tone }> = {
  AAA: { label: "AAA institutional", tone: "warning" },
  AA: { label: "AA preferred", tone: "info" },
  A: { label: "A standard", tone: "neutral" },
};

export const tierOptions = (Object.keys(tierMeta) as CustomerTier[]).map((value) => ({
  value,
  label: tierMeta[value].label,
}));

export const activityOptions: { value: CustomerActivity; label: string }[] = [
  { value: "all", label: "Activity: any time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export const sortOptions: { value: CustomerSort; label: string }[] = [
  { value: "spend", label: "Total spend (high to low)" },
  { value: "spendLow", label: "Total spend (low to high)" },
  { value: "name", label: "Name (A to Z)" },
  { value: "newest", label: "Newest clients" },
];

export const initialsOf = (name: string) =>
  name
    .replace(/^(dr|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
