import type {
  AccountTier,
  OrderPriority,
  OrderRange,
  OrderSort,
  OrderStage,
  PaymentState,
} from "~/types/admin/orders";
import type { Tone } from "~/types/admin/dashboard";

// Labels, tones and icons for the orders screen. Tones are VStatusBadge props, so no
// Tailwind classes live here. Every status is a word + icon + colour (design.md §22).
// Labels are getters so they are translated when read, not when this file is imported.

export const stageMeta: Record<
  OrderStage,
  { tab: string; status: string; statusTone: Tone; statusIcon: string; payment: string; paymentTone: Tone; paymentIcon: string }
> = {
  awaitingPayment: {
    get tab() { return tr("orders_ui.tab_awaiting_payment"); },
    get status() { return tr("orders_ui.stage_awaiting_payment"); },
    statusTone: "warning",
    statusIcon: "lucide:lock",
    get payment() { return tr("orders_ui.payment_awaiting_transfer"); },
    paymentTone: "neutral",
    paymentIcon: "lucide:clock",
  },
  checking: {
    get tab() { return tr("orders_ui.tab_checking"); },
    get status() { return tr("orders_ui.stage_checking"); },
    statusTone: "warning",
    statusIcon: "lucide:flask-conical",
    get payment() { return tr("orders_ui.payment_held_for_tests"); },
    paymentTone: "accent",
    paymentIcon: "lucide:shield-alert",
  },
  packing: {
    get tab() { return tr("orders_ui.tab_packing"); },
    get status() { return tr("orders_ui.stage_packing"); },
    statusTone: "warning",
    statusIcon: "lucide:package",
    get payment() { return tr("orders_ui.payment_paid"); },
    paymentTone: "warning",
    paymentIcon: "lucide:landmark",
  },
  inTransit: {
    get tab() { return tr("orders_ui.tab_in_transit"); },
    get status() { return tr("orders_ui.stage_in_transit"); },
    statusTone: "info",
    statusIcon: "lucide:truck",
    get payment() { return tr("orders_ui.payment_paid"); },
    paymentTone: "warning",
    paymentIcon: "lucide:landmark",
  },
  completed: {
    get tab() { return tr("orders_ui.tab_completed"); },
    get status() { return tr("orders_ui.stage_completed"); },
    statusTone: "success",
    statusIcon: "lucide:shield-check",
    get payment() { return tr("orders_ui.payment_settled_label"); },
    paymentTone: "success",
    paymentIcon: "lucide:shield-check",
  },
};

export const stageOptions = (Object.keys(stageMeta) as OrderStage[]).map((value) => ({
  value,
  get label() { return stageMeta[value].tab; },
}));

export const paymentOptions: { value: "all" | PaymentState; label: string }[] = [
  { value: "all", get label() { return tr("orders_ui.payment_option_all"); } },
  { value: "awaitingTransfer", get label() { return tr("orders_ui.payment_awaiting"); } },
  { value: "paid", get label() { return tr("orders_ui.payment_paid"); } },
  { value: "onHold", get label() { return tr("orders_ui.payment_held"); } },
  { value: "settled", get label() { return tr("orders_ui.payment_settled"); } },
];

export const tierMeta: Record<AccountTier, { label: string; tone: Tone }> = {
  enterprise: { get label() { return tr("customers_ui.segment_short_enterprise"); }, tone: "warning" },
  business: { get label() { return tr("customers_ui.segment_short_business"); }, tone: "info" },
  printShop: { get label() { return tr("orders_ui.tier_print_shop_reseller"); }, tone: "neutral" },
  home: { get label() { return tr("customers_ui.segment_home"); }, tone: "neutral" },
};

export const tierOptions: { value: "all" | AccountTier; label: string }[] = [
  { value: "all", get label() { return tr("orders_ui.tier_option_all"); } },
  ...(Object.keys(tierMeta) as AccountTier[]).map((value) => ({
    value,
    get label() { return tierMeta[value].label; },
  })),
];

export const priorityMeta: Record<OrderPriority, { label: string; tone: Tone }> = {
  urgent: { get label() { return tr("orders_ui.urgent"); }, tone: "accent" },
  bulk: { get label() { return tr("orders_ui.priority_bulk"); }, tone: "neutral" },
  installation: { get label() { return tr("orders_ui.priority_installation"); }, tone: "neutral" },
  service: { get label() { return tr("orders_ui.priority_service"); }, tone: "info" },
  hold: { get label() { return tr("orders_ui.priority_hold"); }, tone: "warning" },
  standard: { get label() { return tr("orders_ui.priority_standard_label"); }, tone: "neutral" },
  vip: { get label() { return tr("orders_ui.priority_vip"); }, tone: "warning" },
};

export const rangeOptions: { value: OrderRange; label: string }[] = [
  { value: "all", get label() { return tr("orders_ui.range_option_all"); } },
  { value: "30d", get label() { return tr("orders_ui.range_30d"); } },
  { value: "7d", get label() { return tr("orders_ui.range_7d"); } },
];

export const sortOptions: { value: OrderSort; label: string }[] = [
  { value: "newest", get label() { return tr("orders_ui.sort_date_newest"); } },
  { value: "oldest", get label() { return tr("orders_ui.sort_date_oldest"); } },
  { value: "high", get label() { return tr("orders_ui.sort_value_high"); } },
  { value: "low", get label() { return tr("orders_ui.sort_value_low"); } },
];
