import type { Tone } from "~/types/admin/dashboard";
import type { InventoryFilter, InventorySort, MovementType, Vault } from "~/types/admin/inventory";

// Labels, tones and icons for the inventory screen (no Tailwind classes, see order-meta.ts).

export const vaultLabel: Record<Vault, string> = {
  "FKT-01": "Frankfurt vault A",
  "ZUR-OPT": "Zurich optics vault",
  "GOT-01": "Gothenburg depot",
};

export const vaultOptions = [
  { value: "all", label: "Vault: all" },
  ...(Object.keys(vaultLabel) as Vault[]).map((value) => ({ value, label: vaultLabel[value] })),
];

export const filterTabs: { value: InventoryFilter; label: string }[] = [
  { value: "all", label: "All inventory" },
  { value: "healthy", label: "Healthy stock" },
  { value: "low", label: "Low stock alerts" },
  { value: "out", label: "Out of stock" },
  { value: "qa", label: "QA hold" },
];

export const sortOptions: { value: InventorySort; label: string }[] = [
  { value: "urgent", label: "Most urgent first" },
  { value: "qtyAsc", label: "Quantity (lowest first)" },
  { value: "qtyDesc", label: "Quantity (highest first)" },
  { value: "value", label: "Stock value (highest first)" },
];

export const movementMeta: Record<MovementType, { label: string; tone: Tone; icon: string }> = {
  allocation: { label: "Allocation", tone: "accent", icon: "lucide:lock" },
  inbound: { label: "Inbound", tone: "success", icon: "lucide:package-plus" },
  dispatch: { label: "Dispatch", tone: "info", icon: "lucide:truck" },
  transfer: { label: "Transfer", tone: "neutral", icon: "lucide:arrow-right-left" },
  calibration: { label: "Calibration", tone: "warning", icon: "lucide:microscope" },
  adjustment: { label: "Adjustment", tone: "neutral", icon: "lucide:sliders-horizontal" },
};
