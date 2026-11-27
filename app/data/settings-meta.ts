import type {
  CardMethod,
  CurrencyCode,
  EscortTier,
  RoundingMode,
  SettingsKey,
  SettingsSectionMeta,
} from "~/types/admin/settings";

// Labels and the section map for the settings screen (no Tailwind classes, see order-meta.ts).
// Labels are getters so they are translated when read, in the current language.

/** The language the interface is showing now (for date names). */
const currentLocale = (): string => {
  const l = tryUseNuxtApp()?.$i18n?.locale as unknown;
  const v = l && typeof l === "object" && "value" in (l as object) ? (l as { value: unknown }).value : l;
  return typeof v === "string" && v ? v : "en";
};

export const sectionList: SettingsSectionMeta[] = [
  {
    id: "store",
    get label() { return tr("settings_ui.sec_store"); },
    key: "store",
    get group() { return tr("settings_ui.group_store_brand"); },
  },
  {
    id: "contact",
    get label() { return tr("settings_ui.sec_contact"); },
    key: "contact",
    get group() { return tr("settings_ui.group_store_brand"); },
  },
  { id: "payments", get label() { return tr("settings_ui.sec_payments"); }, key: "payments", get group() { return tr("settings_ui.group_commerce"); } },
  { id: "shipping", get label() { return tr("settings_ui.sec_shipping"); }, key: "shipping", get group() { return tr("settings_ui.group_commerce"); } },
  { id: "orders", get label() { return tr("settings_ui.sec_orders"); }, key: "orders", get group() { return tr("settings_ui.group_commerce"); } },
  {
    id: "inventory",
    get label() { return tr("settings_ui.sec_inventory"); },
    key: "inventory",
    get group() { return tr("settings_ui.group_operations"); },
  },
];

// Each entry reads the section label when asked, so it follows the language.
export const sectionKeyLabel = Object.defineProperties(
  {},
  Object.fromEntries(
    sectionList.map((s) => [s.key, { enumerable: true, get: () => s.label }]),
  ),
) as Record<SettingsKey, string>;

export const timezoneOptions = [
  "Africa/Cairo",
  "Europe/Zurich",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
  "UTC",
].map((value) => ({ value, label: value.replace("_", " ") }));

export const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: "EGP", get label() { return tr("settings_ui.currency_egp"); } },
  { value: "EUR", get label() { return tr("settings_ui.currency_eur"); } },
  { value: "CHF", get label() { return tr("settings_ui.currency_chf"); } },
  { value: "USD", get label() { return tr("settings_ui.currency_usd"); } },
  { value: "GBP", get label() { return tr("settings_ui.currency_gbp"); } },
];

export const roundingOptions: { value: RoundingMode; label: string }[] = [
  { value: "cent", get label() { return tr("settings_ui.rounding_cent"); } },
  { value: "unit", get label() { return tr("settings_ui.rounding_unit"); } },
  { value: "five", get label() { return tr("settings_ui.rounding_five"); } },
];

export const cardMethodOptions: {
  value: CardMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "wallet",
    get label() { return tr("settings_ui.card_wallet_label"); },
    get description() { return tr("settings_ui.card_wallet_hint"); },
  },
  {
    value: "sepa",
    get label() { return tr("settings_ui.card_sepa_label"); },
    get description() { return tr("settings_ui.card_sepa_hint"); },
  },
  {
    value: "zero-liability",
    get label() { return tr("settings_ui.card_zero_label"); },
    get description() { return tr("settings_ui.card_zero_hint"); },
  },
  {
    value: "local",
    get label() { return tr("settings_ui.card_local_label"); },
    get description() { return tr("settings_ui.card_local_hint"); },
  },
];

export const escortOptions: {
  value: EscortTier;
  label: string;
  description: string;
}[] = [
  {
    value: "standard",
    get label() { return tr("settings_ui.escort_standard_label"); },
    get description() { return tr("settings_ui.escort_standard_hint"); },
  },
  {
    value: "dedicated",
    get label() { return tr("settings_ui.escort_dedicated_label"); },
    get description() { return tr("settings_ui.escort_dedicated_hint"); },
  },
  {
    value: "armored",
    get label() { return tr("settings_ui.escort_armored_label"); },
    get description() { return tr("settings_ui.escort_armored_hint"); },
  },
  {
    value: "diplomatic",
    get label() { return tr("settings_ui.escort_diplomatic_label"); },
    get description() { return tr("settings_ui.escort_diplomatic_hint"); },
  },
];

export const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(currentLocale(), {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
