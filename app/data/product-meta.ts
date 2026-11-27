import type {
  ProductSort,
  ProductStatus,
  StockFilter,
  StockState,
} from "~/types/admin/products";
import type { Tone } from "~/types/admin/dashboard";

// Labels, tones and icons for the products screen (no Tailwind classes, see order-meta.ts).
// Labels are getters so they are translated when read, not when this file is imported.

export const stockMeta: Record<StockState, { label: string; tone: Tone; icon: string }> = {
  ok: { get label() { return tr("products_ui.stock_ok"); }, tone: "success", icon: "lucide:circle-check" },
  low: { get label() { return tr("products_ui.stock_low"); }, tone: "warning", icon: "lucide:triangle-alert" },
  out: { get label() { return tr("products_ui.stock_out"); }, tone: "accent", icon: "lucide:circle-alert" },
};

export const stockOptions: { value: StockFilter; label: string }[] = [
  { value: "all", get label() { return tr("products_ui.stock_all"); } },
  { value: "ok", get label() { return tr("products_ui.stock_ok"); } },
  { value: "depleted", get label() { return tr("products_ui.stock_depleted"); } },
  { value: "low", get label() { return tr("products_ui.stock_low"); } },
  { value: "out", get label() { return tr("products_ui.stock_out"); } },
];

export const statusMeta: Record<ProductStatus, { label: string; tone: Tone; icon: string }> = {
  active: { get label() { return tr("products_ui.status_active"); }, tone: "success", icon: "lucide:shield-check" },
  testing: { get label() { return tr("products_ui.status_testing"); }, tone: "info", icon: "lucide:flask-conical" },
  hold: { get label() { return tr("products_ui.status_hold"); }, tone: "accent", icon: "lucide:shield-alert" },
  draft: { get label() { return tr("products_ui.status_draft"); }, tone: "neutral", icon: "lucide:file-text" },
};

export const statusOptions: { value: "all" | ProductStatus; label: string }[] = [
  { value: "all", get label() { return tr("products_ui.status_all"); } },
  ...(Object.keys(statusMeta) as ProductStatus[]).map((value) => ({
    value,
    get label() { return statusMeta[value].label; },
  })),
];

export const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "newest", get label() { return tr("products_ui.sort_newest"); } },
  { value: "name", get label() { return tr("products_ui.sort_name"); } },
  { value: "priceHigh", get label() { return tr("products_ui.sort_price_high"); } },
  { value: "priceLow", get label() { return tr("products_ui.sort_price_low"); } },
  { value: "stockLow", get label() { return tr("products_ui.sort_stock_low"); } },
];

export const stockStateOf = (p: { stock: number; min: number }): StockState =>
  p.stock <= 0 ? "out" : p.stock <= p.min ? "low" : "ok";
