import type {
  Product,
  ProductCategory,
  ProductInput,
  ProductSort,
  ProductStatus,
  ProductsQuery,
  ProductsResponse,
  StockFilter,
  Template
} from "~/types/admin/products";
import { categoryMeta, stockStateOf } from "~/data/product-meta";

// Demo catalog for the products screen. When the app has a backend this file goes away and
// server/api/admin/products/* proxies the real service.

const templates: Template[] = [
  { prefix: "HAS-X2D", name: "Hasselblad X2D 100C", tag: "IBIS 5-AXIS", spec: "Medium format backside-illuminated CMOS", serialKind: "S/N", category: "cameras", brand: "Hasselblad AB", price: 8199, unit: "unit", min: 4 },
  { prefix: "HAS-XCD", name: "Hasselblad XCD 55mm f/2.5 V", tag: "ASPH", spec: "Prime leaf-shutter lens, 1/2000s sync", serialKind: "S/N", category: "glass", brand: "Hasselblad AB", price: 3699, unit: "unit", min: 3 },
  { prefix: "EPS-SCP", name: "Epson SureColor P9570", tag: "12-COLOR", spec: '44" fine-art piezo master engine', serialKind: "S/N", category: "printers", brand: "Seiko Epson Corp", price: 8190, unit: "unit", min: 2 },
  { prefix: "HAH-PR", name: "Hahnemühle Photo Rag 308gsm", tag: "ACID-FREE", spec: "44in × 39ft roll · 100% cotton rag", serialKind: "BATCH", category: "rag", brand: "Hahnemühle FineArt", price: 269, unit: "roll", min: 12 },
  { prefix: "LCA-SUM", name: "Leica Summilux-C 35mm T1.4", tag: "METRIC", spec: "Master cine prime optical element", serialKind: "S/N", category: "glass", brand: "Leica Camera AG", price: 14200, unit: "unit", min: 2 },
  { prefix: "EPS-UC12", name: "UltraChrome PRO12 Ink Set", tag: "12× 700ML", spec: "Master pack mineral pigment formulation", serialKind: "LOT", category: "pigments", brand: "Seiko Epson Corp", price: 2850, unit: "unit", min: 3 },
  { prefix: "XRT-I1P3", name: "X-Rite i1Pro 3 Plus", tag: "SPECTRO", spec: "Spectral colour profiler with polarization M3", serialKind: "S/N", category: "metrology", brand: "X-Rite Pantone", price: 2450, unit: "unit", min: 2 },
  { prefix: "CNS-PFR", name: "Canson Platine Fibre Rag", tag: "DMAX 2.4", spec: "60in × 50ft roll · 100% cotton platinum base", serialKind: "BATCH", category: "rag", brand: "Canson Infinity", price: 345, unit: "roll", min: 8 },
  { prefix: "PHO-IQ4", name: "Phase One IQ4 150MP", tag: "TRICHROMATIC", spec: "151MP BSI digital back", serialKind: "S/N", category: "cameras", brand: "Phase One A/S", price: 44500, unit: "unit", min: 1 },
  { prefix: "ARR-SIG", name: "ARRI Signature Prime 35mm", tag: "LPL", spec: "Large-format cine prime, T1.8", serialKind: "S/N", category: "glass", brand: "ARRI AG", price: 18900, unit: "unit", min: 2 },
  { prefix: "CAN-PRO", name: "Canon imagePROGRAF PRO-4100", tag: "LUCIA PRO", spec: '44" 12-ink pigment printer', serialKind: "S/N", category: "printers", brand: "Canon Inc.", price: 5200, unit: "unit", min: 2 },
  { prefix: "PIE-CPS", name: "Piezography Pro Carbon Set", tag: "K7", spec: "Monochrome mineral suspensions", serialKind: "LOT", category: "pigments", brand: "Cone Editions", price: 840, unit: "unit", min: 4 },
];

// The first screen of the register is hand-picked so low-stock states are visible at once.
const seeds: { t: number; stock: number }[] = [
  { t: 0, stock: 8 },
  { t: 1, stock: 2 },
  { t: 2, stock: 4 },
  { t: 3, stock: 6 },
  { t: 4, stock: 1 },
  { t: 5, stock: 0 },
  { t: 6, stock: 0 },
  { t: 7, stock: 28 },
];

const VARIANTS = ["Kit A", "Kit B", "Studio pack", "Refurbished", "Demo unit", "Bulk pack", "Archive grade"];
const TOTAL = 4812;

const eanOf = (n: number) => `7${String(332700000000 + n * 7919).padStart(12, "0")}`;

const make = (n: number, t: Template, stock: number, variant: number): Product => {
  const code = (1000 + n).toString(36).toUpperCase();
  const suffix = variant ? ` · ${VARIANTS[variant % VARIANTS.length]} ${variant}` : "";
  return {
    id: `p-${n}`,
    sku: `${t.prefix}-${code}`,
    ean: eanOf(n),
    name: `${t.name}${suffix}`,
    tag: t.tag,
    spec: t.spec,
    serial: `${t.serialKind}: ${t.prefix}-${String(100000 + n * 37).slice(-6)}`,
    category: t.category,
    brand: t.brand,
    // Variants are kits and accessories, priced as a small fraction of the flagship item.
    price: variant ? Math.max(5, Math.round(t.price * (0.008 + (variant % 5) * 0.004))) : t.price,
    stock,
    min: t.min,
    unit: t.unit,
    // Exactly 14 on the bench and 3 quarantined across the register; a few drafts.
    status:
      n % 343 === 5 + seeds.length && n >= seeds.length
        ? "bench"
        : n % 1601 === 9 + seeds.length && n >= seeds.length
          ? "quarantine"
          : n >= seeds.length && n % 97 === 50
            ? "draft"
            : "active",
    icon: categoryMeta[t.category].icon,
  };
};

const store: Product[] = [
  ...seeds.map((s, n) => make(n, templates[s.t]!, s.stock, 0)),
  ...Array.from({ length: TOTAL - seeds.length }, (_, k) => {
    const n = seeds.length + k;
    const t = templates[k % templates.length]!;
    // Two more depleted SKUs (7 critical in total with the seeds); the rest are comfortably stocked.
    const stock = k === 900 ? 0 : k === 2500 ? t.min : t.min * (2 + (k % 5)) + 1 + (k % 3);
    return make(n, t, stock, Math.floor(k / templates.length) + 1);
  }),
];

let seq = TOTAL;

export const productBrands = () => [...new Set(store.map((p) => p.brand))].sort();

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

export const parseProductsQuery = (raw: Record<string, unknown>): ProductsQuery => {
  const page = Number.parseInt(String(raw.page), 10);
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 80) : "",
    category: pick(raw.category, ["all", ...(Object.keys(categoryMeta) as ProductCategory[])] as const, "all"),
    brand: typeof raw.brand === "string" && raw.brand.length < 80 ? raw.brand : "all",
    stock: pick<StockFilter>(raw.stock, ["all", "ok", "low", "out", "depleted"], "all"),
    status: pick(raw.status, ["all", "active", "bench", "quarantine", "draft"] as const, "all"),
    sort: pick<ProductSort>(raw.sort, ["newest", "name", "priceHigh", "priceLow", "stockLow"], "newest"),
    page: Number.isFinite(page) ? Math.min(100_000, Math.max(1, page)) : 1,
    perPage: Number(pick(String(raw.perPage), ["10", "25", "50"] as const, "10")),
  };
};

export const queryProducts = (query: ProductsQuery): ProductsResponse => {
  const needle = query.q.toLowerCase();

  const filtered = store.filter(
    (p) =>
      (!needle || [p.name, p.sku, p.ean, p.serial, p.brand, p.spec].join(" ").toLowerCase().includes(needle)) &&
      (query.category === "all" || p.category === query.category) &&
      (query.brand === "all" || p.brand === query.brand) &&
      (query.stock === "all" ||
        (query.stock === "depleted"
          ? stockStateOf(p) !== "ok"
          : stockStateOf(p) === query.stock)) &&
      (query.status === "all" || p.status === query.status),
  );

  const sorted = [...filtered];
  const order: Record<ProductSort, ((a: Product, b: Product) => number) | null> = {
    newest: null,
    name: (a, b) => a.name.localeCompare(b.name),
    priceHigh: (a, b) => b.price - a.price,
    priceLow: (a, b) => a.price - b.price,
    stockLow: (a, b) => a.stock / a.min - b.stock / b.min,
  };
  const cmp = order[query.sort];
  if (cmp) sorted.sort(cmp);

  const pageCount = Math.max(1, Math.ceil(sorted.length / query.perPage));
  const page = Math.min(query.page, pageCount);

  const depleted = store.filter((p) => stockStateOf(p) !== "ok").length;

  return {
    rows: sorted.slice((page - 1) * query.perPage, page * query.perPage),
    total: sorted.length,
    brands: productBrands(),
    kpis: {
      registered: store.length,
      indexedThisCycle: 18,
      valuationEur: Math.round(store.reduce((sum, p) => sum + p.price * p.stock, 0)),
      depleted,
      bench: store.filter((p) => p.status === "bench").length,
      quarantine: store.filter((p) => p.status === "quarantine").length,
    },
    presets: {
      hasselbladGlass: store.filter((p) => p.brand === "Hasselblad AB" && p.category === "glass").length,
      ragRolls: store.filter((p) => p.category === "rag").length,
      depleted,
    },
  };
};

export const validateProductInput = (body: unknown): ProductInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const sku = typeof b.sku === "string" ? b.sku.trim().toUpperCase() : "";
  const brand = typeof b.brand === "string" ? b.brand.trim() : "";
  const price = Number(b.price);
  const stock = Number(b.stock);
  const min = Number(b.min);
  const category = pick<ProductCategory>(b.category, Object.keys(categoryMeta) as ProductCategory[], "cameras");
  const status = pick<ProductStatus>(b.status, ["active", "bench", "quarantine", "draft"], "active");
  if (
    name.length < 2 || name.length > 120 ||
    !/^[A-Z0-9][A-Z0-9-]{2,30}$/.test(sku) ||
    brand.length < 2 || brand.length > 60 ||
    !(price >= 0 && price <= 1_000_000) ||
    !Number.isInteger(stock) || stock < 0 || stock > 100_000 ||
    !Number.isInteger(min) || min < 0 || min > 100_000
  )
    return null;
  return { name, sku, category, brand, price, stock, min, status };
};

export const skuExists = (sku: string, exceptId?: string) =>
  store.some((p) => p.sku === sku && p.id !== exceptId);

export const createProduct = (input: ProductInput): Product => {
  const n = seq++;
  const product: Product = {
    id: `p-${n}`,
    ean: eanOf(n),
    tag: "NEW",
    spec: categoryMeta[input.category].label,
    serial: `S/N: ${input.sku}`,
    unit: input.category === "rag" ? "roll" : "unit",
    icon: categoryMeta[input.category].icon,
    ...input,
  };
  store.unshift(product);
  return product;
};

export const updateProduct = (id: string, patch: Partial<ProductInput>): Product | null => {
  const product = store.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  if (patch.category) product.icon = categoryMeta[patch.category].icon;
  return product;
};

export const deleteProducts = (ids: string[]): number => {
  const gone = new Set(ids);
  const before = store.length;
  for (let i = store.length - 1; i >= 0; i--) if (gone.has(store[i]!.id)) store.splice(i, 1);
  return before - store.length;
};

export const findProduct = (id: string) => store.find((p) => p.id === id);
