import { DEFAULT_CURRENCY } from "~/config/i18n/currency";

// Number formatting for the admin dashboard, backed by vue-i18n's `n()` so
// output follows the active locale (https://vue-i18n.intlify.dev/guide/essentials/number).
// The store only trades in Egypt, so every amount is EGP; the `currency_EGP`
// format lives in `numberFormats` (i18n.config.ts) and per-call Intl options
// are merged on top of it.
export const useFormatters = () => {
  const { n } = useI18n();

  const number = (value: number, options: Intl.NumberFormatOptions = {}) =>
    n(value, options);

  const currency = (value: number, options: Intl.NumberFormatOptions = {}) =>
    n(value, { key: `currency_${DEFAULT_CURRENCY}`, ...options });

  const compactCurrency = (value: number) =>
    currency(value, { notation: "compact", maximumFractionDigits: 1 });

  const compact = (value: number) =>
    number(value, { notation: "compact", maximumFractionDigits: 1 });

  const percent = (value: number, digits = 1) =>
    `${number(value, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

  const signedPercent = (value: number, digits = 1) =>
    `${value > 0 ? "+" : ""}${percent(value, digits)}`;

  return { number, currency, compactCurrency, compact, percent, signedPercent };
};
