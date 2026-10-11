export type Tone = "success" | "accent" | "warning" | "info" | "neutral";

export type RangeKey = "today" | "week" | "month" | "quarter" | "year";

export type RevenueUnit = "hour" | "day" | "week" | "month";

export interface RevenuePoint {
  hardware: number;
  substrates: number;
}

export interface RevenueSeries {
  range: RangeKey;
  unit: RevenueUnit;
  points: RevenuePoint[];
  peakIndex: number;
  marginIndex: number;
  marginDelta: number;
}

export interface DashboardKpis {
  gross: {
    value: number;
    delta: number;
    usdEquivalent: number;
    breakdown: { key: "hardware" | "substrates" | "labRuns"; value: number }[];
    trend: number[];
  };
  requisitions: {
    value: number;
    delta: number;
    averageBasket: number;
    clearingPct: number;
    settled: number;
    held: number;
  };
  ateliers: {
    value: number;
    delta: number;
    retentionPct: number;
    tiers: { key: "museums" | "commercial" | "galleries"; pct: number }[];
    activeContracts: number;
    rating: string;
  };
  skus: {
    value: number;
    alerts: number;
    divisions: number;
    leadTimeHours: number;
    mix: {
      key: "cameras" | "printers" | "substrates" | "pigments" | "accessories";
      value: number;
    }[];
  };
}

export type StockStatus = "critical" | "depleting" | "scheduled";

export interface LowStockItem {
  sku: string;
  name: string;
  spec: string;
  status: StockStatus;
  remaining: number;
  threshold: number;
  unit: "units" | "rolls" | "canisters";
  note: "lead" | "run" | "edi" | "priority";
  noteValue: string;
  action: "restockLens" | "restockSubstrate" | "confirmEdi" | "emergencySpares";
}

export type OrderStatus =
  | "qaPending"
  | "armoredTransit"
  | "escrowSettled"
  | "inProduction"
  | "cleanroomQa";

export interface RequisitionRow {
  id: string;
  client: string;
  location: string;
  allocation: string;
  amount: number;
  status: OrderStatus;
  action: "releaseEscrow" | "printWaybill" | "viewDossier" | "auditBatch";
}

export interface TopProduct {
  rank: number;
  name: string;
  spec: string;
  division: "mediumFormat" | "piezoEngines" | "fineArtMedia" | "pigmentChemistry";
  unitValue: number;
  volume: number;
  volumeUnit: "units" | "rolls" | "kits";
  revenue: number;
  qa: string;
  icon: string;
}

export interface StudioDossier {
  initials: string;
  name: string;
  location: string;
  lifetimeEscrow: number;
  tier: "museumCustody" | "galleryPremium" | "collectiveGuild" | "institutionalArchive";
  node: string;
}

export interface FulfillmentSegment {
  key: "delivered" | "transit" | "qa" | "curing";
  value: number;
}

export interface DashboardSummary {
  alerts: { escrowBacklog: number; lowStock: number };
  kpis: DashboardKpis;
  fulfillment: { total: number; fulfilledPct: number; segments: FulfillmentSegment[] };
  lowStock: LowStockItem[];
  topProducts: TopProduct[];
  orders: { rows: RequisitionRow[]; total: number; slaPct: number };
  studios: StudioDossier[];
  topShare: number;
}
