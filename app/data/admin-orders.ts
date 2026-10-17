import type {
  ClientTier,
  CreateOrderInput,
  EscrowMode,
  OrderCounts,
  OrderPriority,
  LedgerEvent,
  OrderDetail,
  OrderLine,
  OrderNote,
  OrderPhase,
  OrderRow,
  OrderStage,
  OrdersQuery,
  OrdersResponse,
} from "~/types/admin/orders";
import { orderPricing } from "~/data/order-pricing";

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

/** Extra accessories on an order, derived from its id so the list and detail agree. */
const extrasFor = (idNumber: number, mainIx: number) => {
  const out: { ix: number; quantity: number }[] = [];
  for (let k = 0; k < idNumber % 3; k++) {
    const ix = (idNumber * 5 + k * 3 + 1) % apparatus.length;
    if (ix !== mainIx && !out.some((o) => o.ix === ix))
      out.push({ ix, quantity: 1 + ((idNumber + k) % 2) });
  }
  return out;
};

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
  const customer = customers[customerIx]!;
  const pick = (list: string[]) => list[variant % list.length]!;
  const priced = [
    { unitPrice: a.price, quantity },
    ...extrasFor(idNumber, apparatusIx).map((e) => ({
      unitPrice: apparatus[e.ix]!.price,
      quantity: e.quantity,
    })),
  ];
  return {
    id: `#LP-${idNumber}`,
    hex: hexOf(idNumber),
    priority,
    placedAt: new Date(placedAt).toISOString(),
    customer: { ...customer },
    allocation: {
      title: a.title,
      quantity,
      unit: a.unit,
      spec: a.spec,
      icon: a.icon,
    },
    amount: orderPricing(priced, customer.tier).total,
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

// ---------------------------------------------------------------------------
// Order detail
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortStamp = (iso: string) =>
  `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))} ${iso.slice(11, 16)} UTC`;

const skuOf = (ix: number) =>
  `${apparatus[ix]!.title
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.slice(0, 3).toUpperCase())
    .join("-")}-${ix * 37 + 110}`;

export const pipelineStages: { stage: OrderStage; title: string }[] = [
  { stage: "escrowClearing", title: "Escrow funded & logged" },
  { stage: "cleanroomQa", title: "Cleanroom QA & collimation" },
  { stage: "outgassing", title: "Outgassing & packing" },
  { stage: "inTransit", title: "Armored freight dispatch" },
  { stage: "settled", title: "Conservator handoff" },
];

// Where each stage sits in the five-step pipeline (settled = every step done).
const ACTIVE_PHASE: Record<OrderStage, number> = {
  escrowClearing: 0,
  cleanroomQa: 1,
  outgassing: 2,
  inTransit: 3,
  settled: 5,
};

const SHIPMENT_STATUS: Record<OrderStage, string> = {
  escrowClearing: "Vault hold",
  cleanroomQa: "Awaiting dispatch",
  outgassing: "Awaiting dispatch",
  inTransit: "Climate vault en route",
  settled: "Delivered",
};

// Notes and ledger events added through the API live here until the server restarts.
const addedNotes = new Map<string, OrderNote[]>();
const addedEvents = new Map<string, LedgerEvent[]>();
let noteSeq = 100;
let clock = 0;
// New events land after every seeded one, so they always show at the top of the ledger.
const tick = () =>
  new Date(DEMO_NOW + 86_400_000 + ++clock * 60_000).toISOString();

export const findOrder = (slug: string) =>
  allOrders().find((o) => o.id === `#${slug}`);

const logEvent = (id: string, text: string) => {
  addedEvents.set(id, [{ at: tick(), text }, ...(addedEvents.get(id) ?? [])]);
};

export const orderDetail = (slug: string): OrderDetail | null => {
  const row = findOrder(slug);
  if (!row) return null;

  const idNumber = Number(slug.slice(3));
  const mainIx = apparatus.findIndex((a) => a.title === row.allocation.title);
  const lines: OrderLine[] = [
    { ix: mainIx, quantity: row.allocation.quantity },
    ...extrasFor(idNumber, mainIx),
  ].map(({ ix, quantity }) => {
    const a = apparatus[ix]!;
    return {
      sku: skuOf(ix),
      title: a.title,
      spec: a.spec,
      icon: a.icon,
      quantity,
      unit: a.unit,
      unitPrice: a.price,
      total: a.price * quantity,
    };
  });

  const active = ACTIVE_PHASE[row.stage];
  const phaseDetail = [
    `Funded & logged · ${shortStamp(row.placedAt)}`,
    "Bench #04 · interferometer 0.22µm",
    "Nitrogen purge · hermetic seal",
    "Lloyd's courier tier-1 · dual armed escort",
    "Escrow settlement · biometric receipt",
  ];
  const phases: OrderPhase[] = pipelineStages.map((p, i) => ({
    ...p,
    detail: phaseDetail[i]!,
    state: i < active ? "done" : i === active ? "active" : "pending",
  }));

  const mine = allOrders().filter((o) => o.customer.name === row.customer.name);
  const slugName = row.customer.name
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.|\.$/g, "");
  const domain = row.customer.org.toLowerCase().replace(/[^a-z]+/g, "").slice(0, 14);

  const seedNotes: OrderNote[] = [
    {
      id: 1,
      author: "COO Admin (Station-01)",
      ago: "2 hours ago",
      text: "Interferometer test on XCD 55mm lens showed minor chromatic flare at f/2.5. Re-centered element #3. Collimation now nominal 99.4% MTF.",
      urgent: false,
    },
    {
      id: 2,
      author: "Escrow Officer M. Klein",
      ago: "4 hours ago",
      text: `Wire transfer of EGP ${row.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} confirmed via Deutsche Bank Trust. Escrow vault lock established.`,
      urgent: false,
    },
  ];

  const at = Date.parse(row.placedAt);
  const stamp = (min: number) => new Date(at + min * 60_000).toISOString();
  const base: LedgerEvent[] = [
    { at: stamp(0), text: `Requisition created via Atelier Portal by ${row.customer.name}` },
  ];
  if (active >= 1) {
    base.push({ at: stamp(13), text: "Escrow funded notification transmitted to customer" });
    base.push({ at: stamp(95), text: "Collimation report uploaded by Tech-04 (SHA-256 verified)" });
  }
  if (active >= 3) base.push({ at: stamp(300), text: "Outgassing complete · crate sealed under nitrogen" });
  if (active >= 4) base.push({ at: stamp(480), text: "Custody handed to conservator · escrow released" });
  else if (active === 3)
    base.push({ at: stamp(480), text: `Armored courier dispatched · waybill BRK-${idNumber}-EU` });

  return {
    row,
    lines,
    pricing: orderPricing(lines, row.customer.tier),
    phases,
    customer: {
      role: ["Chief Conservator", "Head of Collections", "Master Printer", "Imaging Director"][idNumber % 4]!,
      email: `${slugName}@${domain}.org`,
      phone: `+${[1, 33, 49, 41][idNumber % 4]} (${200 + (idNumber % 700)}) ${535 + (idNumber % 400)}-${7000 + (idNumber % 2999)}`,
      taxId: `EIN ${10 + (idNumber % 80)}-${1000000 + ((idNumber * 7919) % 8999999)}`,
      lifetimeEscrow: Math.round(
        mine.filter((o) => o.stage === "settled").reduce((sum, o) => sum + o.amount, 0),
      ),
      orders: mine.length,
    },
    shipment: {
      status: SHIPMENT_STATUS[row.stage],
      carrier: "Brink's Armored Fine-Art Logistics",
      waybill: `BRK-${idNumber}-EU`,
      origin: "Lumen & Press Metrology Depot 01, Frankfurt Node",
      destination: `${row.customer.org} — receiving dock 4B`,
      sensors: { temp: "18.5 °C", humidity: "45% RH", shock: "< 0.26 G" },
      trace: Array.from({ length: 24 }, (_, i) => 50 + Math.round(Math.sin(i * 1.7 + idNumber) * 8)),
    },
    directive: {
      quote:
        "Please ensure optical bench collimation report is physically signed and hermetically sealed inside the inner Pelican case. Cleanroom delivery must coordinate with Security Dock 4B before 11:00 AM EST.",
      recordedAt: `Recorded ${shortStamp(row.placedAt)} · authenticated via client keyring`,
    },
    notes: [...(addedNotes.get(row.id) ?? []), ...seedNotes],
    ledger: [...(addedEvents.get(row.id) ?? []), ...base].sort(
      (a, b) => Date.parse(b.at) - Date.parse(a.at),
    ),
  };
};

export const setOrderStage = (slug: string, stage: OrderStage): OrderRow | null => {
  const row = findOrder(slug);
  if (!row) return null;
  if (row.stage !== stage) {
    row.stage = stage;
    row.escrowNote = ESCROW_NOTES[stage][0]!;
    row.custodyNote = CUSTODY_NOTES[stage][0]!;
    logEvent(
      row.id,
      stage === "settled"
        ? "Escrow released and requisition fulfilled by COO Admin"
        : `Pipeline moved to "${pipelineStages.find((p) => p.stage === stage)!.title}" by COO Admin`,
    );
  }
  return row;
};

export const addOrderNote = (slug: string, text: string, urgent: boolean): OrderNote | null => {
  const row = findOrder(slug);
  if (!row) return null;
  const note: OrderNote = {
    id: ++noteSeq,
    author: "COO Admin (Station-01)",
    ago: "Just now",
    text,
    urgent,
  };
  // Urgent notes pin to the top; the rest keep newest-first order.
  const list = addedNotes.get(row.id) ?? [];
  addedNotes.set(
    row.id,
    urgent
      ? [note, ...list]
      : [...list.filter((n) => n.urgent), note, ...list.filter((n) => !n.urgent)],
  );
  logEvent(row.id, "Internal note added by COO Admin");
  return note;
};

export const isOrderSlug = (value: unknown): value is string =>
  typeof value === "string" && /^LP-\d{5,7}$/.test(value);

export const isOrderStage = (value: unknown): value is OrderStage =>
  typeof value === "string" && STAGE_SIZES.some(([s]) => s === value);
