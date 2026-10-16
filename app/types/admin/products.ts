export type ProductCategory =
  | "cameras"
  | "glass"
  | "printers"
  | "rag"
  | "pigments"
  | "metrology";

export type ProductStatus = "active" | "bench" | "quarantine" | "draft";

export type StockState = "ok" | "low" | "out";

/** "depleted" = low or out. */
export type StockFilter = "all" | StockState | "depleted";

export type ProductSort =
  | "newest"
  | "name"
  | "priceHigh"
  | "priceLow"
  | "stockLow";

export interface Product {
  id: string;
  sku: string;
  ean: string;
  name: string;
  tag: string;
  spec: string;
  /** "S/N: …" or "BATCH: …" line. */
  serial: string;
  category: ProductCategory;
  brand: string;
  /** Unit price in EUR. */
  price: number;
  stock: number;
  /** Reorder point: at or below this the product is low on stock. */
  min: number;
  unit: "unit" | "roll";
  status: ProductStatus;
  icon: string;
}

export interface ProductsQuery {
  q: string;
  category: "all" | ProductCategory;
  brand: string;
  stock: StockFilter;
  status: "all" | ProductStatus;
  sort: ProductSort;
  page: number;
  perPage: number;
}

export interface ProductsResponse {
  rows: Product[];
  total: number;
  brands: string[];
  kpis: {
    registered: number;
    indexedThisCycle: number;
    valuationEur: number;
    depleted: number;
    bench: number;
    quarantine: number;
  };
  presets: { hasselbladGlass: number; ragRolls: number; depleted: number };
}

export interface ProductInput {
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  price: number;
  stock: number;
  min: number;
  status: ProductStatus;
}

export interface Template {
  prefix: string;
  name: string;
  tag: string;
  spec: string;
  serialKind: "S/N" | "BATCH" | "LOT";
  category: ProductCategory;
  brand: string;
  price: number;
  unit: "unit" | "roll";
  min: number;
}
