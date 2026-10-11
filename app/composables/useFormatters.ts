// Number formatting for the admin dashboard (English only for now).
export const useFormatters = () => {
  const tag = "en-US";

  const number = (value: number, options: Intl.NumberFormatOptions = {}) =>
    new Intl.NumberFormat(tag, options).format(value);

  const currency = (value: number, options: Intl.NumberFormatOptions = {}) =>
    number(value, { style: "currency", currency: "EUR", ...options });

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
