export type Tone = "success" | "accent" | "warning" | "info" | "neutral";

export type RangeKey = "today" | "week" | "month" | "quarter" | "year";

export type RevenueUnit = "hour" | "day" | "week" | "month";

export interface RevenuePoint {
  revenue: number;
  orders: number;
}

export interface RevenueSeries {
  range: RangeKey;
  unit: RevenueUnit;
  points: RevenuePoint[];
  peakIndex: number;
}

export interface DashboardKpis {
  revenue: { value: number; delta: number; trend: number[] };
  orders: { value: number; delta: number };
  customers: { value: number; delta: number };
  products: { value: number };
  lowStock: { value: number };
  pendingOrders: { value: number };
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

export interface RecentCustomer {
  initials: string;
  name: string;
  location: string;
  lifetimeValue: number;
  tier: "museumCustody" | "galleryPremium" | "collectiveGuild" | "institutionalArchive";
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  lowStock: LowStockItem[];
  topProducts: TopProduct[];
  orders: { rows: RequisitionRow[]; total: number; slaPct: number };
  customers: RecentCustomer[];
}
