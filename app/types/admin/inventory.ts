import type {
  Product,
  ProductCategory,
  StockState,
} from "~/types/admin/products";

export type Vault = "FKT-01" | "ZUR-OPT" | "GOT-01";

export type InventoryFilter = "all" | "healthy" | "low" | "out" | "qa";

export type InventorySort = "urgent" | "qtyAsc" | "qtyDesc" | "value";

/** A product as the inventory ledger sees it: stock plus where it is kept. */
export interface InventoryItem extends Product {
  vault: Vault;
  bin: string;
  /** Units promised to open requisitions. */
  reserved: number;
  /** Units that can still be promised: stock minus reserved. */
  available: number;
  state: StockState;
  /** Waiting on bench metrology or vendor recertification. */
  qaHold: boolean;
}

export interface InventoryQuery {
  q: string;
  category: "all" | ProductCategory;
  vault: "all" | Vault;
  filter: InventoryFilter;
  sort: InventorySort;
  page: number;
  perPage: number;
}

export interface InventoryResponse {
  rows: InventoryItem[];
  total: number;
  counts: Record<InventoryFilter, number>;
  kpis: {
    valuation: number;
    units: number;
    skus: number;
    healthyPct: number;
    low: number;
    out: number;
    /** Cost to bring every out-of-stock SKU back to its reorder point. */
    reorderValue: number;
  };
}

export type MovementType =
  | "allocation"
  | "inbound"
  | "dispatch"
  | "transfer"
  | "calibration"
  | "adjustment";

export interface Movement {
  id: string;
  type: MovementType;
  /** Signed change in units; null for moves that don't change the count. */
  qty: number | null;
  sku: string;
  name: string;
  note: string;
  actor: string;
  at: string;
}

export interface AdjustInput {
  productId: string;
  mode: "delta" | "set";
  qty: number;
  reason: string;
}

export interface ReceiveInput {
  productId: string;
  qty: number;
  reference: string;
}

export interface TransferInput {
  productId: string;
  vault: Vault;
}

/** The editable record of an inventory item (add and edit share it). */
export interface ItemInput {
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  /** Unit value. */
  price: number;
  stock: number;
  /** Reorder point. */
  min: number;
  vault: Vault;
  bin: string;
}