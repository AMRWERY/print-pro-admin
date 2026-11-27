import type { Tone } from "~/types/admin/dashboard";
import type { InventoryFilter, InventorySort, MovementType, Warehouse } from "~/types/admin/inventory";

// Labels, tones and icons for the inventory screen (no Tailwind classes, see order-meta.ts).
// Labels are getters so they are translated when read, not when this file is imported.

export const warehouseLabel: Record<Warehouse, string> = {
  get "CAI-01"() { return tr("inventory_ui.warehouse_cairo"); },
  get "GIZ-02"() { return tr("inventory_ui.warehouse_giza"); },
  get "ALX-01"() { return tr("inventory_ui.warehouse_alex"); },
};

export const warehouseOptions = [
  { value: "all", get label() { return tr("inventory_ui.warehouse_all"); } },
  ...(Object.keys(warehouseLabel) as Warehouse[]).map((value) => ({
    value,
    get label() { return warehouseLabel[value]; },
  })),
];

export const filterTabs: { value: InventoryFilter; label: string }[] = [
  { value: "all", get label() { return tr("inventory_ui.tab_all"); } },
  { value: "healthy", get label() { return tr("inventory_ui.tab_healthy"); } },
  { value: "low", get label() { return tr("inventory_ui.tab_low"); } },
  { value: "out", get label() { return tr("inventory_ui.tab_out"); } },
  { value: "hold", get label() { return tr("inventory_ui.tab_hold"); } },
];

export const sortOptions: { value: InventorySort; label: string }[] = [
  { value: "urgent", get label() { return tr("inventory_ui.sort_urgent"); } },
  { value: "qtyAsc", get label() { return tr("inventory_ui.sort_qty_asc"); } },
  { value: "qtyDesc", get label() { return tr("inventory_ui.sort_qty_desc"); } },
  { value: "value", get label() { return tr("inventory_ui.sort_value"); } },
];

export const movementMeta: Record<MovementType, { label: string; tone: Tone; icon: string }> = {
  allocation: { get label() { return tr("inventory_ui.movement_allocation"); }, tone: "accent", icon: "lucide:lock" },
  inbound: { get label() { return tr("inventory_ui.movement_inbound_label"); }, tone: "success", icon: "lucide:package-plus" },
  dispatch: { get label() { return tr("inventory_ui.movement_dispatch"); }, tone: "info", icon: "lucide:truck" },
  transfer: { get label() { return tr("inventory_ui.movement_transfer"); }, tone: "neutral", icon: "lucide:arrow-right-left" },
  testing: { get label() { return tr("inventory_ui.movement_testing"); }, tone: "warning", icon: "lucide:flask-conical" },
  adjustment: { get label() { return tr("inventory_ui.movement_adjustment"); }, tone: "neutral", icon: "lucide:sliders-horizontal" },
};
