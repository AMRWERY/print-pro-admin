import type { Tier } from "~/types/auth";

export const tiers: { id: Tier; tag: string; title: string; body: string }[] = [
  {
    id: "atelier",
    tag: "Tier 01",
    title: "Print atelier & lab",
    body: "Vacuum tables, roll-stock reserve.",
  },
  {
    id: "museum",
    tag: "Tier 02",
    title: "Museum & cultural body",
    body: "Curatorial grants, zero-reflectance glass.",
  },
  {
    id: "photographer",
    tag: "Tier 03",
    title: "Master photographer",
    body: "Apochromat primes, mobile cleanroom kit.",
  },
];
