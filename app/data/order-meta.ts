import type {
  ClientTier,
  EscrowMode,
  OrderPriority,
  OrderRange,
  OrderSort,
  OrderStage,
} from "~/types/admin/orders";
import type { Tone } from "~/types/admin/dashboard";

// Labels, tones and icons for the orders screen. Tones are VStatusBadge props, so no
// Tailwind classes live here. Every status is a word + icon + colour (design.md §22).

export const stageMeta: Record<
  OrderStage,
  { tab: string; custody: string; custodyTone: Tone; custodyIcon: string; escrow: string; escrowTone: Tone; escrowIcon: string }
> = {
  escrowClearing: {
    tab: "Escrow clearing",
    custody: "Payment lock",
    custodyTone: "warning",
    custodyIcon: "lucide:lock",
    escrow: "Awaiting wire",
    escrowTone: "neutral",
    escrowIcon: "lucide:clock",
  },
  inTransit: {
    tab: "In-transit freight",
    custody: "Armored transit",
    custodyTone: "info",
    custodyIcon: "lucide:truck",
    escrow: "Escrow funded",
    escrowTone: "warning",
    escrowIcon: "lucide:landmark",
  },
  cleanroomQa: {
    tab: "Cleanroom QA",
    custody: "Cleanroom QA",
    custodyTone: "warning",
    custodyIcon: "lucide:microscope",
    escrow: "Escrow QA hold",
    escrowTone: "accent",
    escrowIcon: "lucide:shield-alert",
  },
  outgassing: {
    tab: "Outgassing",
    custody: "Outgassing",
    custodyTone: "warning",
    custodyIcon: "lucide:clock",
    escrow: "Escrow funded",
    escrowTone: "warning",
    escrowIcon: "lucide:landmark",
  },
  settled: {
    tab: "Settled & delivered",
    custody: "Delivered",
    custodyTone: "success",
    custodyIcon: "lucide:shield-check",
    escrow: "Settled & released",
    escrowTone: "success",
    escrowIcon: "lucide:shield-check",
  },
};

export const stageOptions = (Object.keys(stageMeta) as OrderStage[]).map((value) => ({
  value,
  label: stageMeta[value].tab,
}));

export const escrowOptions: { value: "all" | EscrowMode; label: string }[] = [
  { value: "all", label: "All escrow modes" },
  { value: "awaitingWire", label: "Awaiting wire" },
  { value: "funded", label: "Funded" },
  { value: "qaHold", label: "QA hold" },
  { value: "settled", label: "Settled & released" },
];

export const tierMeta: Record<ClientTier, { label: string; tone: Tone }> = {
  museumCustody: { label: "Museum custody AAA", tone: "warning" },
  galleryPremium: { label: "Gallery premium", tone: "neutral" },
  institutionalArchive: { label: "Institutional archive", tone: "info" },
  collectiveGuild: { label: "Collective guild", tone: "neutral" },
};

export const tierOptions: { value: "all" | ClientTier; label: string }[] = [
  { value: "all", label: "All client tiers" },
  ...(Object.keys(tierMeta) as ClientTier[]).map((value) => ({
    value,
    label: tierMeta[value].label,
  })),
];

export const priorityMeta: Record<OrderPriority, { label: string; tone: Tone }> = {
  priority: { label: "Priority", tone: "accent" },
  commercial: { label: "Commercial", tone: "neutral" },
  archive: { label: "Archive", tone: "neutral" },
  metrology: { label: "Metrology", tone: "info" },
  hold: { label: "Hold", tone: "warning" },
  standard: { label: "Standard", tone: "neutral" },
  vip: { label: "VIP", tone: "warning" },
};

export const rangeOptions: { value: OrderRange; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "30d", label: "Last 30 days" },
  { value: "7d", label: "Last 7 days" },
];

export const sortOptions: { value: OrderSort; label: string }[] = [
  { value: "newest", label: "Order date (newest first)" },
  { value: "oldest", label: "Order date (oldest first)" },
  { value: "high", label: "Escrow value (high to low)" },
  { value: "low", label: "Escrow value (low to high)" },
];
