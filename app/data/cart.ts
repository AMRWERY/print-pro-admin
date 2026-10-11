import type { Voucher } from "~/types/cart";

/** Demo codes. Real validation belongs on the server. */
export const vouchers: Record<string, Voucher> = {
  "BIENNIAL-PRINT-2025": {
    label: "Biennial print rebate",
    type: "flat",
    amount: 500,
    minSubtotal: 2000,
  },
  STUDIO5: { label: "Studio welcome", type: "percent", amount: 5 },
};

export const pricing = {
  /** Orders at or above this value (after discounts) ship free. */
  freeFreightFrom: 2500,
  freight: 149,
  taxRate: 0.085,
  /** Media rolls, 3 or more per line. */
  volumeMinQty: 3,
  volumeRate: 0.07,
};

export const cartAssurances = [
  {
    icon: "lucide:shield-check",
    label: "3-year zero-deductible mechanical warranty",
  },
  {
    icon: "lucide:flask-conical",
    label: "Pre-flight bench QA & collimation verified",
  },
  { icon: "lucide:truck", label: "Free cleanroom crated dispatch over $2,500" },
  { icon: "lucide:headset", label: "Concierge hotline: +1 (800) 492-LUMN" },
];

/** Suggested pairings for the "complementary" section (skips anything in the cart). */
export const companionIds = [
  "colorchecker",
  "canson-platine",
  "hahnemuhle-308",
  "b10x",
  "summilux",
  "pro4100",
];