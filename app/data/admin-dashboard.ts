import type {
  DashboardSummary,
  RangeKey,
  RevenueSeries,
  RevenueUnit,
} from "~/types/admin/dashboard";

// Demo data for the executive bench. When the app has a backend this file goes away and
// server/api/admin/* proxies the real service.

export const dashboardSummary: DashboardSummary = {
  kpis: {
    revenue: {
      value: 482940,
      delta: 14.8,
      trend: [38, 41, 40, 46, 44, 52, 49, 58, 63, 61, 70, 78],
    },
    orders: { value: 1284, delta: 8.4 },
    customers: { value: 3420, delta: 142 },
    products: { value: 4812 },
    lowStock: { value: 7 },
    pendingOrders: { value: 42 },
  },
  lowStock: [
    {
      sku: "HBL-55V-ASPH",
      name: "Hasselblad XCD 55mm f/2.5 V",
      spec: "Optical glass",
      status: "critical",
      remaining: 2,
      threshold: 5,
      unit: "units",
      note: "lead",
      noteValue: "12d · Göteborg",
      action: "restockLens",
    },
    {
      sku: "HAH-PR-4439",
      name: "Hahnemühle Photo Rag 308gsm",
      spec: "44in × 12m roll",
      status: "depleting",
      remaining: 6,
      threshold: 15,
      unit: "rolls",
      note: "run",
      noteValue: "Bocholt",
      action: "restockSubstrate",
    },
    {
      sku: "EPS-PRO12-C700",
      name: "UltraChrome PRO12 Cyan",
      spec: "700ml pigment",
      status: "scheduled",
      remaining: 4,
      threshold: 12,
      unit: "canisters",
      note: "edi",
      noteValue: "Scheduled",
      action: "confirmEdi",
    },
    {
      sku: "EPS-PHA-P9570",
      name: "Epson P9570 Printhead Engine",
      spec: "MicroPiezo AMC",
      status: "critical",
      remaining: 1,
      threshold: 3,
      unit: "units",
      note: "priority",
      noteValue: "Lab A",
      action: "emergencySpares",
    },
  ],
  topProducts: [
    {
      rank: 1,
      name: "Hasselblad X2D 100C Body",
      spec: "100MP BSI CMOS · 16-bit colour",
      division: "mediumFormat",
      unitValue: 8199,
      volume: 48,
      volumeUnit: "units",
      revenue: 393552,
      qa: "100% PASS",
      icon: "lucide:camera",
    },
    {
      rank: 2,
      name: "Epson SureColor P9570 44in Engine",
      spec: "UltraChrome PRO12 · SpectroProofer",
      division: "piezoEngines",
      unitValue: 8190,
      volume: 22,
      volumeUnit: "units",
      revenue: 180180,
      qa: "100% CALIBRATED",
      icon: "lucide:printer",
    },
    {
      rank: 3,
      name: "Hahnemühle Photo Rag 308gsm",
      spec: "100% cotton · smooth matte D-Max 1.7",
      division: "fineArtMedia",
      unitValue: 269,
      volume: 312,
      volumeUnit: "rolls",
      revenue: 83928,
      qa: "ISO 9706",
      icon: "lucide:layers",
    },
    {
      rank: 4,
      name: "Canson Infinity Platine Fibre Rag 310gsm",
      spec: "Pure platinum barium sulphate base",
      division: "fineArtMedia",
      unitValue: 289,
      volume: 184,
      volumeUnit: "rolls",
      revenue: 53176,
      qa: "ACID-FREE",
      icon: "lucide:layers",
    },
    {
      rank: 5,
      name: "Piezography Pro Carbon Pigment Set",
      spec: "Monochrome pure mineral suspensions",
      division: "pigmentChemistry",
      unitValue: 840,
      volume: 64,
      volumeUnit: "kits",
      revenue: 53760,
      qa: "D50 CURVED",
      icon: "lucide:flask-conical",
    },
  ],
  orders: {
    total: 42,
    slaPct: 100,
    rows: [
      {
        id: "#LP-948201",
        client: "Dr. Elena Vance",
        location: "NYC Archival Wing",
        allocation: "1× Hasselblad X2D · 2× XCD Prime",
        amount: 14290,
        status: "qaPending",
        action: "releaseEscrow",
      },
      {
        id: "#LP-948198",
        client: "Galerie Max Hetzler",
        location: "Berlin Tiergarten",
        allocation: "12× Hahnemühle Photo Rag · UltraChrome X3",
        amount: 4820,
        status: "armoredTransit",
        action: "printWaybill",
      },
      {
        id: "#LP-948195",
        client: "Zurich Kunsthaus Lab",
        location: "Conservation Lab",
        allocation: "1× Epson P9570 Archival Engine",
        amount: 8190,
        status: "escrowSettled",
        action: "viewDossier",
      },
      {
        id: "#LP-948190",
        client: "Magnum Photos Node",
        location: "Paris Studio 04",
        allocation: "1× Piezography Pro Kit · 4× Platine",
        amount: 3780,
        status: "inProduction",
        action: "auditBatch",
      },
      {
        id: "#LP-948188",
        client: "Basler Lichtbild Atelier",
        location: "Basel, Switzerland",
        allocation: "4× Canson Platine Fibre · Spectral Sensor",
        amount: 2140,
        status: "escrowSettled",
        action: "viewDossier",
      },
    ],
  },
  customers: [
    { initials: "EV", name: "Dr. Elena Vance", location: "Metropolitan Wing · NYC", lifetimeValue: 142500, tier: "museumCustody" },
    { initials: "MH", name: "Galerie Max Hetzler", location: "Tiergarten · Berlin", lifetimeValue: 98400, tier: "galleryPremium" },
    { initials: "MP", name: "Magnum Photos", location: "Darkroom Node · Paris", lifetimeValue: 76200, tier: "collectiveGuild" },
    { initials: "ZK", name: "Zurich Kunsthaus Lab", location: "Conservation · Zurich", lifetimeValue: 112800, tier: "institutionalArchive" },
  ],
};

const RANGES: Record<
  RangeKey,
  { count: number; unit: RevenueUnit; scale: number }
> = {
  today: { count: 24, unit: "hour", scale: 0.04 },
  week: { count: 7, unit: "day", scale: 0.35 },
  month: { count: 30, unit: "day", scale: 1 },
  quarter: { count: 13, unit: "week", scale: 3.2 },
  year: { count: 12, unit: "month", scale: 12 },
};

export const isRangeKey = (value: unknown): value is RangeKey =>
  typeof value === "string" && value in RANGES;

/** Deterministic wave so the charts are stable between reloads. */
export const revenueSeries = (range: RangeKey): RevenueSeries => {
  const { count, unit, scale } = RANGES[range];
  const points = Array.from({ length: count }, (_, i) => {
    const progress = count > 1 ? i / (count - 1) : 1;
    const wave = Math.sin(i * 1.3) * 0.08 + Math.sin(i * 0.5) * 0.05;
    const revenue = Math.round(scale * (20000 + progress * 16000) * (1 + wave));
    return { revenue, orders: Math.max(1, Math.round(revenue / 420)) };
  });
  const peakIndex = points.reduce(
    (best, p, i) => (p.revenue > points[best]!.revenue ? i : best),
    0,
  );
  return { range, unit, points, peakIndex };
};
