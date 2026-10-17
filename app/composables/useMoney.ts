import { DEFAULT_CURRENCY } from "~/config/i18n/currency";

export const useMoney = () => {
  const { n } = useI18n();

  return {
    format: (value: number) => n(value, `currency_${DEFAULT_CURRENCY}`),
  };
};
