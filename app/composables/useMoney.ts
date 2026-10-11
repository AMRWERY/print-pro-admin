const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const useMoney = () => ({
  format: (value: number) => usd.format(value),
});
