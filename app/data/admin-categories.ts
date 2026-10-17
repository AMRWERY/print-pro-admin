import type {
  CategoriesResponse,
  Category,
  CategoryInput,
  CategorySort,
  CategoryVisibility,
} from "~/types/admin/categories";

// Demo taxonomy for the categories screen. When the app has a backend this file goes away
// and server/api/admin/categories/* proxies the real service.

type Seed = Pick<Category, "name" | "slug" | "skus"> &
  Partial<Pick<Category, "visibility" | "abstract">>;

const masters: (Seed & { icon: string; code: string; children: Seed[] })[] = [
  {
    code: "CAT-CAM-01",
    icon: "lucide:camera",
    name: "Medium Format Cameras & Digital Backs",
    slug: "/cameras-optics/medium-format",
    skus: 342,
    abstract:
      "Precision medium-format digital back systems, modular chassis, and extreme-resolution sensors engineered for institutional archives and studio masters.",
    children: [
      {
        name: "BSI CMOS Bodies & Systems",
        slug: "/cameras-optics/medium-format/bsi-cmos",
        skus: 128,
      },
      {
        name: "Digital Backs & Scanning Sensor Units",
        slug: "/cameras-optics/medium-format/sensor-backs",
        skus: 64,
      },
      {
        name: "XCD & HC Lens Assemblies",
        slug: "/cameras-optics/medium-format/xcd-hc-lenses",
        skus: 150,
      },
    ],
  },
  {
    code: "CAT-OPT-02",
    icon: "lucide:clapperboard",
    name: "Cine & Prime Glass",
    slug: "/optics/cine-prime",
    skus: 418,
    abstract:
      "Cinema and prime lenses, bench-certified and calibrated for sharpness and colour.",
    children: [
      {
        name: "Anamorphic & Spherical Primes",
        slug: "/optics/cine-prime/primes",
        skus: 184,
      },
      {
        name: "PL & L-Mount Telephoto Cine Glass",
        slug: "/optics/cine-prime/telephoto",
        skus: 142,
      },
      {
        name: "Follow Focus & Matte Box Mechanics",
        slug: "/optics/cine-prime/mechanics",
        skus: 92,
      },
    ],
  },
  {
    code: "CAT-PRN-03",
    icon: "lucide:printer",
    name: "Archival Large-Format Piezo Printers",
    slug: "/print-engines/large-format",
    skus: 128,
    abstract:
      "Production-class and proofing-grade piezoelectric large format plotters with 10–12 color pigment sets and inline spectrophotometers.",
    children: [
      {
        name: '24" & 44" Fine Art Master Engines',
        slug: "/print-engines/large-format/master-engines",
        skus: 68,
      },
      {
        name: '64" Commercial Production Systems',
        slug: "/print-engines/large-format/production",
        skus: 34,
      },
      {
        name: "SpectroProofer & Spectrophotometer Heads",
        slug: "/print-engines/large-format/spectro-heads",
        skus: 26,
      },
    ],
  },
  {
    code: "CAT-SUB-04",
    icon: "lucide:layers",
    name: "Cotton Rag & Archival Substrates",
    slug: "/substrates/cotton-rag",
    skus: 1840,
    abstract:
      "Museum-grade cotton rag, baryta and washi papers in rolls and sheets.",
    children: [
      {
        name: "100% Pure Cotton Rag (308–310gsm)",
        slug: "/substrates/cotton-rag/pure-cotton",
        skus: 890,
      },
      {
        name: "Baryta & True Darkroom Fibre Gloss",
        slug: "/substrates/cotton-rag/baryta",
        skus: 540,
      },
      {
        name: "Japanese Washi & Textured Alpha-Cellulose",
        slug: "/substrates/cotton-rag/washi",
        skus: 410,
      },
    ],
  },
  {
    code: "CAT-INK-05",
    icon: "lucide:flask-conical",
    name: "Mineral Pigment Chemistry & Inks",
    slug: "/pigments/mineral-inks",
    skus: 1902,
    abstract:
      "Mineral pigment suspensions and inks for monochrome and chromatic fine-art printing.",
    children: [
      {
        name: "Carbon Black & Monochrome Sets",
        slug: "/pigments/mineral-inks/monochrome",
        skus: 720,
      },
      {
        name: "Chromatic Pigment Inks",
        slug: "/pigments/mineral-inks/chromatic",
        skus: 930,
      },
      {
        name: "Cleaning & Maintenance Fluids",
        slug: "/pigments/mineral-inks/maintenance",
        skus: 252,
      },
    ],
  },
  {
    code: "CAT-MET-06",
    icon: "lucide:gauge",
    name: "Metrology, D50 Spectro & Darkroom Tools",
    slug: "/metrology-tools",
    skus: 182,
    visibility: "staging",
    abstract:
      "Spectrophotometers, light boxes and viewing booths. Not yet public.",
    children: [
      {
        name: "Spectrophotometers",
        slug: "/metrology-tools/spectrophotometers",
        skus: 90,
        visibility: "staging",
      },
      {
        name: "Light Boxes & Viewing Booths",
        slug: "/metrology-tools/viewing",
        skus: 92,
        visibility: "staging",
      },
    ],
  },
];

const seed = (): Category[] => {
  const out: Category[] = [];
  masters.forEach((m, mi) => {
    const id = `c-${mi + 1}`;
    out.push({
      id,
      code: m.code,
      name: m.name,
      slug: m.slug,
      parentId: null,
      order: mi,
      skus: m.skus,
      visibility: m.visibility ?? "active",
      abstract: m.abstract ?? "",
      icon: m.icon,
      megamenu: mi < 4,
      publicIndexing: (m.visibility ?? "active") === "active",
      facetRank: Math.min(5, mi + 1),
      defaultSort: "curated",
    });
    m.children.forEach((c, ci) =>
      out.push({
        id: `${id}-${ci + 1}`,
        code: `${m.code}-${String.fromCharCode(65 + ci)}`,
        name: c.name,
        slug: c.slug,
        parentId: id,
        order: ci,
        skus: c.skus,
        visibility: c.visibility ?? "active",
        abstract: "",
        icon: m.icon,
        megamenu: false,
        publicIndexing: (c.visibility ?? "active") === "active",
        facetRank: 3,
        defaultSort: "curated",
      }),
    );
  });
  return out;
};

const store: Category[] = seed();
let seq = 100;

const siblings = (parentId: string | null) =>
  store
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.order - b.order);

export const listCategories = (): CategoriesResponse => {
  const roots = store.filter((c) => c.parentId === null);
  return {
    nodes: [...store].sort((a, b) => a.order - b.order),
    kpis: {
      masters: roots.length,
      children: store.length - roots.length,
      skus: roots.reduce((sum, c) => sum + c.skus, 0),
      unpublished: store.filter((c) => c.visibility !== "active").length,
    },
  };
};

const pick = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

const slugOf = (v: unknown) =>
  `/${String(v ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .split("/")
    .map((s) => s.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/")}`.slice(0, 120);

/** Trims and clamps the browser's input. Returns null when something required is wrong. */
export const validateCategory = (body: unknown): CategoryInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const slug = slugOf(b.slug);
  const facetRank = Number(b.facetRank);
  if (name.length < 2 || name.length > 80 || slug === "/") return null;
  return {
    name,
    slug,
    parentId: typeof b.parentId === "string" && b.parentId ? b.parentId : null,
    visibility: pick<CategoryVisibility>(
      b.visibility,
      ["active", "staging", "hidden"],
      "active",
    ),
    abstract:
      typeof b.abstract === "string" ? b.abstract.trim().slice(0, 400) : "",
    megamenu: b.megamenu === true,
    publicIndexing: b.publicIndexing === true,
    facetRank: Number.isInteger(facetRank)
      ? Math.min(5, Math.max(1, facetRank))
      : 3,
    defaultSort: pick<CategorySort>(
      b.defaultSort,
      ["curated", "newest", "priceAsc", "priceDesc"],
      "curated",
    ),
  };
};

export type CategoryCheck = "ok" | "slug" | "parent";

/** Slug must be unique; the parent must be a master category (the tree is two levels deep). */
export const checkCategory = (
  input: CategoryInput,
  selfId?: string,
): CategoryCheck => {
  if (store.some((c) => c.slug === input.slug && c.id !== selfId))
    return "slug";
  if (input.parentId) {
    const parent = store.find((c) => c.id === input.parentId);
    if (!parent || parent.parentId !== null || input.parentId === selfId)
      return "parent";
    // A category that already has children can't become a child itself.
    if (selfId && store.some((c) => c.parentId === selfId)) return "parent";
  }
  return "ok";
};

const codeFor = (input: CategoryInput, id: string) => {
  const parent = input.parentId
    ? store.find((c) => c.id === input.parentId)
    : null;
  return parent
    ? `${parent.code}-${String.fromCharCode(65 + siblings(parent.id).length)}`
    : `CAT-${
        input.name
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 3)
          .toUpperCase() || "NEW"
      }-${id.slice(2).padStart(2, "0")}`;
};

export const createCategory = (input: CategoryInput): Category => {
  const id = `c-${++seq}`;
  const parent = input.parentId
    ? store.find((c) => c.id === input.parentId)
    : null;
  const category: Category = {
    ...input,
    id,
    code: codeFor(input, id),
    order: siblings(input.parentId).length,
    skus: 0,
    icon: parent?.icon ?? "lucide:folder-tree",
  };
  store.push(category);
  return category;
};

export const updateCategory = (
  id: string,
  input: CategoryInput,
): Category | null => {
  const category = store.find((c) => c.id === id);
  if (!category) return null;
  const moved = category.parentId !== input.parentId;
  Object.assign(category, input);
  if (moved) {
    category.order = siblings(input.parentId).filter((c) => c.id !== id).length;
  }
  return category;
};

/** Deletes a category and, with it, every sub-category under it. */
export const deleteCategory = (id: string): number => {
  const gone = new Set([
    id,
    ...store.filter((c) => c.parentId === id).map((c) => c.id),
  ]);
  const before = store.length;
  for (let i = store.length - 1; i >= 0; i--)
    if (gone.has(store[i]!.id)) store.splice(i, 1);
  return before - store.length;
};

/** Sets the order of one sibling group. `ids` must be exactly the members of that group. */
export const reorderCategories = (
  parentId: string | null,
  ids: string[],
): boolean => {
  const group = siblings(parentId);
  if (ids.length !== group.length || !group.every((c) => ids.includes(c.id)))
    return false;
  ids.forEach((id, order) => {
    store.find((c) => c.id === id)!.order = order;
  });
  return true;
};

export const findCategory = (id: string) => store.find((c) => c.id === id);