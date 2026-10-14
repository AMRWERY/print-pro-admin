export type OrderStage =
  | "escrowClearing"
  | "inTransit"
  | "cleanroomQa"
  | "outgassing"
  | "settled";

export type EscrowMode = "awaitingWire" | "funded" | "qaHold" | "settled";

export type ClientTier =
  | "museumCustody"
  | "galleryPremium"
  | "institutionalArchive"
  | "collectiveGuild";

export type OrderPriority =
  | "priority"
  | "commercial"
  | "archive"
  | "metrology"
  | "hold"
  | "standard"
  | "vip";

export type OrderRange = "all" | "30d" | "7d";
export type OrderSort = "newest" | "oldest" | "high" | "low";

export interface OrderRow {
  id: string;
  hex: string;
  priority: OrderPriority;
  placedAt: string;
  customer: {
    name: string;
    org: string;
    initials: string;
    tier: ClientTier;
  };
  allocation: {
    title: string;
    quantity: number;
    unit: "item" | "roll";
    spec: string;
    icon: string;
  };
  amount: number;
  stage: OrderStage;
  escrowNote: string;
  custodyNote: string;
}

export interface OrdersQuery {
  q: string;
  stage: "all" | OrderStage;
  escrow: "all" | EscrowMode;
  tier: "all" | ClientTier;
  range: OrderRange;
  sort: OrderSort;
  page: number;
  perPage: number;
}

export type OrderCounts = Record<"all" | OrderStage, number>;

export interface OrdersResponse {
  rows: OrderRow[];
  /** Rows matching every filter (drives pagination). */
  total: number;
  /** Per-stage counts under the current non-stage filters (drives the tabs). */
  counts: OrderCounts;
  kpis: {
    totalRequisitions: number;
    historicalDelta: number;
    volumeEur: number;
    volumeUsd: number;
    pendingEscrowEur: number;
    quarantineHold: number;
  };
}

export interface CreateOrderInput {
  customerId: number;
  apparatusId: number;
  quantity: number;
  priority: OrderPriority;
}
