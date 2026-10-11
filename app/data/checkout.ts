import type { DeliveryOption } from "~/types/checkout";

export const countries = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "EG", name: "Egypt" },
];

export const deliveryOptions: DeliveryOption[] = [
  {
    id: "crated",
    label: "Climate-crated freight (insured)",
    note: "Cleanroom crate with white-glove delivery and unboxing.",
    days: 5,
    icon: "lucide:truck",
  },
  {
    id: "express",
    label: "Bonded vault dispatch (express)",
    note: "Temperature-controlled transport, signature on delivery.",
    days: 2,
    icon: "lucide:zap",
  },
  {
    id: "pickup",
    label: "Studio pickup (NYC lab)",
    note: "Collect from our bench after quality sign-off.",
    days: 1,
    icon: "lucide:store",
  },
];

/** Flat price for options that don't follow the free-freight rule. */
export const deliveryPrices = { express: 349, pickup: 0 } as const;

export const paymentMethods = [
  {
    id: "card",
    label: "Credit or debit card",
    note: "Visa, Mastercard, Amex",
    icon: "lucide:credit-card",
  },
  {
    id: "wire",
    label: "Wire transfer / escrow",
    note: "Save 2% on the order",
    icon: "lucide:landmark",
  },
] as const;

export const WIRE_DISCOUNT = 0.02;

export const checkoutSteps = [
  { n: 1, title: "Contact & address", short: "Address" },
  { n: 2, title: "Delivery", short: "Delivery" },
  { n: 3, title: "Payment", short: "Payment" },
  { n: 4, title: "Review & place order", short: "Review" },
] as const;
