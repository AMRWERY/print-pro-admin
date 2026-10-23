import type { Tier } from "~/types/auth";

export const tiers: { id: Tier; tag: string; title: string; body: string }[] = [
  {
    id: "business",
    tag: "Account 01",
    title: "Business & office",
    body: "Printers, photocopiers and supplies for your team.",
  },
  {
    id: "reseller",
    tag: "Account 02",
    title: "Print shop & reseller",
    body: "Volume pricing on machines and consumables.",
  },
  {
    id: "home",
    tag: "Account 03",
    title: "Home & small office",
    body: "A printer and the ink or toner to run it.",
  },
];
