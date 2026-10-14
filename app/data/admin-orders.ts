import type {
  ClientTier,
  CreateOrderInput,
  EscrowMode,
  OrderCounts,
  OrderPriority,
  OrderRow,
  OrderStage,
  OrdersQuery,
  OrdersResponse,
} from "~/types/admin/orders";

// Demo ledger for the orders screen. When the app has a backend this file goes away and
// server/api/admin/orders.* proxies the real service.

export const customers: {
  name: string;
  org: string;
  initials: string;
  tier: ClientTier;
}[] = [
  {
    name: "Dr. Elena Vance",
    org: "Metropolitan Archival Wing",
    initials: "EV",
    tier: "museumCustody",
  },
  {
    name: "Jean-Luc Hébert",
    org: "Fondation Lumière Paris",
    initials: "JH",
    tier: "galleryPremium",
  },
  {
    name: "Kenji Takahashi",
    org: "Kyoto Museum of Photography",
    initials: "KT",
    tier: "institutionalArchive",
  },
  {
    name: "Astrid Weber",
    org: "Bauhaus Archive Berlin",
    initials: "AW",
    tier: "museumCustody",
  },
  {
    name: "Vincent van Boeg",
    org: "Rijksmuseum Restoration Lab",
    initials: "VB",
    tier: "institutionalArchive",
  },
  {
    name: "Sora Moriyama",
    org: "Ginza Master Print Guild",
    initials: "SM",
    tier: "collectiveGuild",
  },
  {
    name: "Marcella Hauer",
    org: "Alps Alpine Metrology Lab",
    initials: "MH",
    tier: "museumCustody",
  },
  {
    name: "Marcus Thorne",
    org: "Thorne Fine Graphic Atelier",
    initials: "MT",
    tier: "galleryPremium",
  },
  {
    name: "Sophie Laurent",
    org: "Bibliothèque Nationale Restorations",
    initials: "SL",
    tier: "institutionalArchive",
  },
  {
    name: "Amira Al-Zahrani",
    org: "Louvre Abu Dhabi Conservation Unit",
    initials: "AZ",
    tier: "museumCustody",
  },
  {
    name: "Julien Weber",
    org: "Studio Monochrome Berlin",
    initials: "JW",
    tier: "collectiveGuild",
  },
  {
    name: "Tariq Gibran",
    org: "Gibran Gallery of Modern Cyanotypes",
    initials: "TG",
    tier: "galleryPremium",
  },
];

export const apparatus: {
  title: string;
  unit: "item" | "roll";
  spec: string;
  icon: string;
  price: number;
}[] = [
  {
    title: "Hasselblad X2D 100C + XCD 55mm f/2.5",
    unit: "item",
    spec: "1× system + 2× CFexpress 1TB Type B",
    icon: "lucide:camera",
    price: 11800,
  },
  {
    title: 'Epson SureColor P9570 44" SpectroProofer',
    unit: "item",
    spec: "6× UltraChrome PRO12 ink 700ml",
    icon: "lucide:printer",
    price: 8190,
  },
  {
    title: 'Hahnemühle Photo Rag 308g (60" × 39ft)',
    unit: "roll",
    spec: "Batch lot 2026-HR-90",
    icon: "lucide:layers",
    price: 269,
  },
  {
    title: "Leica Summilux-C 35mm T1.4 Cinema Prime",
    unit: "item",
    spec: "Metric PL mount · calibrated shims",
    icon: "lucide:clapperboard",
    price: 21500,
  },
  {
    title: "X-Rite i1Pro 3 Plus Metrology Spectro",
    unit: "item",
    spec: "Polarization filter + ambient head",
    icon: "lucide:gauge",
    price: 2400,
  },
  {
    title: "Sinar p3-df Modular Digital View Bench",
    unit: "item",
    spec: "Micrometric focus drive + bellows",
    icon: "lucide:camera",
    price: 9800,
  },
  {
    title: "Mineral Carbon Pigment Inks (K7 Monochrome)",
    unit: "item",
    spec: "1000ml flasks · pure carbon Dmax 1.95",
    icon: "lucide:flask-conical",
    price: 840,
  },
  {
    title: "Phase One IQ4 150MP Trichromatic",
    unit: "item",
    spec: "151MP BSI sensor",
    icon: "lucide:camera",
    price: 44500,
  },
  {
    title: "Canon imagePROGRAF PRO-4100",
    unit: "item",
    spec: "4× LUCIA PRO 12-ink",
    icon: "lucide:printer",
    price: 5200,
  },
  {
    title: "ARRI Signature Prime 35mm T1.8",
    unit: "item",
    spec: "LPL mount · metrology logged",
    icon: "lucide:clapperboard",
    price: 18900,
  },
  {
    title: "Canson Infinity Platine Fibre Rag 310g",
    unit: "roll",
    spec: "Acid-free cotton",
    icon: "lucide:layers",
    price: 289,
  },
  {
    title: "Piezography Pro Carbon Pigment Set",
    unit: "item",
    spec: "Monochrome mineral suspensions",
    icon: "lucide:flask-conical",
    price: 840,
  },
];

const TOTAL = 1284;
// Stage sizes that add up to TOTAL. They are spread through the ledger with a stride (793) that
// is coprime with 1284, so every page shows a mix of stages.
const STAGE_SIZES: [OrderStage, number][] = [
  ["escrowClearing", 42],
  ["inTransit", 86],
  ["cleanroomQa", 38],
  ["outgassing", 14],
  ["settled", TOTAL - 42 - 86 - 38 - 14],
];

const stageOrder = STAGE_SIZES.flatMap(([stage, n]) =>
  Array<OrderStage>(n).fill(stage),
);

const PRIORITIES: OrderPriority[] = [
  "priority",
  "commercial",
  "archive",
  "metrology",
  "hold",
  "standard",
  "vip",
];

const ESCROW_NOTES: Record<OrderStage, string[]> = {
  escrowClearing: [
    "IBAN validated · pending inbound",
    "Wire reference matched",
    "Awaiting counter-signature",
  ],
  inTransit: [
    "Credit Suisse vault escrow",
    "Deutsche Bank escrow trust",
    "Suisse vault · escrow",
  ],
  cleanroomQa: [
    "Disputed sensor defect",
    "Pending MTF interferometry",
    "Spectral drift under review",
  ],
  outgassing: ["Deutsche Bank escrow trust", "Credit Suisse vault escrow"],
  settled: [
    "Signature key #9021-X",
    "Block confirmed #9412",
    "Funds transferred",
  ],
};
const CUSTODY_NOTES: Record<OrderStage, string[]> = {
  escrowClearing: ["Warehouse bay 3", "Warehouse bay 7", "Held at depot"],
  inTransit: [
    "Brink's armored · #FR-889",
    "Zurich → destination",
    "Armored freight lane 2",
  ],
  cleanroomQa: [
    "Bench #04 · interferometry",
    "Bench #02 · collimation",
    "Bench #07 · spectral",
  ],
  outgassing: ["Chamber B · 36h remaining", "Chamber A · 12h remaining"],
  settled: ["Custody transferred", "Signed handoff", "Delivered · archived"],
};

/** The ledger has a fixed "now" so filters and sorting are stable between reloads. */
const DEMO_NOW = Date.UTC(2026, 9, 31, 15, 0, 0);
const LATEST = Date.UTC(2026, 9, 31, 14, 22, 8);

const hexOf = (id: number) =>
  `0x${((id * 2654435761) >>> 0).toString(16).toUpperCase().slice(0, 5)}`;

const build = (
  idNumber: number,
  placedAt: number,
  customerIx: number,
  apparatusIx: number,
  quantity: number,
  priority: OrderPriority,
  stage: OrderStage,
  variant: number,
): OrderRow => {
  const a = apparatus[apparatusIx]!;
  const pick = (list: string[]) => list[variant % list.length]!;
  return {
    id: `#LP-${idNumber}`,
    hex: hexOf(idNumber),
    priority,
    placedAt: new Date(placedAt).toISOString(),
    customer: { ...customers[customerIx]! },
    allocation: {
      title: a.title,
      quantity,
      unit: a.unit,
      spec: a.spec,
      icon: a.icon,
    },
    amount: a.price * quantity,
    stage,
    escrowNote: pick(ESCROW_NOTES[stage]),
    custodyNote: pick(CUSTODY_NOTES[stage]),
  };
};

const generated: OrderRow[] = (() => {
  let at = LATEST;
  return Array.from({ length: TOTAL }, (_, i) => {
    if (i) at -= (15 + ((i * 37) % 40)) * 60_000;
    return build(
      948201 - i * 2 - Math.floor(i / 3),
      at,
      (i * 5) % customers.length,
      (i * 7 + Math.floor(i / 12)) % apparatus.length,
      1 + ((i * 3) % 6),
      PRIORITIES[(i * 5) % PRIORITIES.length]!,
      stageOrder[(i * 793) % TOTAL]!,
      i,
    );
  });
})();

// Orders created through the API live here until the server restarts.
const created: OrderRow[] = [];

const allOrders = () => [...created, ...generated];

export const escrowModeOf = (stage: OrderStage): EscrowMode =>
  ({
    escrowClearing: "awaitingWire",
    inTransit: "funded",
    cleanroomQa: "qaHold",
    outgassing: "funded",
    settled: "settled",
  })[stage] as EscrowMode;

const pick = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

const int = (value: unknown, fallback: number, min: number, max: number) => {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Turns untrusted query-string values into a safe OrdersQuery. */
export const parseOrdersQuery = (
  raw: Record<string, unknown>,
): OrdersQuery => ({
  q: typeof raw.q === "string" ? raw.q.trim().slice(0, 80) : "",
  stage: pick(
    raw.stage,
    ["all", ...STAGE_SIZES.map(([s]) => s)] as const,
    "all",
  ),
  escrow: pick(
    raw.escrow,
    ["all", "awaitingWire", "funded", "qaHold", "settled"] as const,
    "all",
  ),
  tier: pick(
    raw.tier,
    [
      "all",
      "museumCustody",
      "galleryPremium",
      "institutionalArchive",
      "collectiveGuild",
    ] as const,
    "all",
  ),
  range: pick(raw.range, ["all", "30d", "7d"] as const, "all"),
  sort: pick(raw.sort, ["newest", "oldest", "high", "low"] as const, "newest"),
  page: int(raw.page, 1, 1, 10_000),
  perPage: Number(pick(String(raw.perPage), ["10", "25", "50"] as const, "10")),
});

export const queryOrders = (query: OrdersQuery): OrdersResponse => {
  const perPage = query.perPage;
  const needle = query.q.toLowerCase();
  const since =
    query.range === "all"
      ? 0
      : DEMO_NOW - (query.range === "7d" ? 7 : 30) * 86_400_000;

  const matchesBase = (o: OrderRow) =>
    (!needle ||
      [
        o.id,
        o.hex,
        o.customer.name,
        o.customer.org,
        o.allocation.title,
        o.allocation.spec,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)) &&
    (query.escrow === "all" || escrowModeOf(o.stage) === query.escrow) &&
    (query.tier === "all" || o.customer.tier === query.tier) &&
    Date.parse(o.placedAt) >= since;

  const base = allOrders().filter(matchesBase);

  const counts: OrderCounts = {
    all: base.length,
    escrowClearing: 0,
    inTransit: 0,
    cleanroomQa: 0,
    outgassing: 0,
    settled: 0,
  };
  for (const o of base) counts[o.stage]++;

  const filtered =
    query.stage === "all" ? base : base.filter((o) => o.stage === query.stage);

  const sorted = [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "oldest":
        return Date.parse(a.placedAt) - Date.parse(b.placedAt);
      case "high":
        return b.amount - a.amount;
      case "low":
        return a.amount - b.amount;
      default:
        return Date.parse(b.placedAt) - Date.parse(a.placedAt);
    }
  });

  const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = Math.min(query.page, pageCount);

  const everything = allOrders();
  return {
    rows: sorted.slice((page - 1) * perPage, page * perPage),
    total: sorted.length,
    counts,
    kpis: {
      totalRequisitions: everything.length,
      historicalDelta: 4.2,
      volumeEur: 482940,
      volumeUsd: 521575,
      pendingEscrowEur: 74210,
      quarantineHold: 9,
    },
  };
};

export const createOrder = (input: CreateOrderInput): OrderRow => {
  const id = 948202 + created.length;
  const row = build(
    id,
    DEMO_NOW + (created.length + 1) * 60_000,
    input.customerId,
    input.apparatusId,
    input.quantity,
    input.priority,
    "escrowClearing",
    id,
  );
  created.unshift(row);
  return row;
};

export const validateCreateOrder = (body: unknown): CreateOrderInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const customerId = Number(b.customerId);
  const apparatusId = Number(b.apparatusId);
  const quantity = Number(b.quantity);
  const priority = pick(b.priority, PRIORITIES, "standard");
  if (
    !Number.isInteger(customerId) ||
    customerId < 0 ||
    customerId >= customers.length ||
    !Number.isInteger(apparatusId) ||
    apparatusId < 0 ||
    apparatusId >= apparatus.length ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 50
  )
    return null;
  return { customerId, apparatusId, quantity, priority };
};
