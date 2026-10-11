import type {
  CatalogCategory,
  CatalogProduct,
  DispatchKey,
  SortKey,
} from "~/types/catalog";

export const categoryOptions: { key: CatalogCategory; label: string }[] = [
  { key: "digital", label: "Digital Backs & Medium Format" },
  { key: "lenses", label: "Cine & Large-Format Lenses" },
  { key: "printers", label: "Pigment Printers" },
  { key: "substrates", label: "Fine-Art Substrates & Baryta" },
  { key: "lighting", label: "Precision Lighting & Packs" },
  { key: "colorimeters", label: "Colorimeters & Spectro" },
];

export const dispatchOptions: { key: DispatchKey; label: string }[] = [
  { key: "in-stock", label: "In stock · ships today" },
  { key: "consignment", label: "Certified consignment" },
  { key: "factory-order", label: "Custom factory order" },
  { key: "freight", label: "White-glove crated freight" },
];

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured & bench tested" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

export const perPageOptions = [12, 24, 48] as const;

export const pricePresets = [
  { label: "Under $1,000", min: null, max: 999 },
  { label: "$1k – $5k", min: 1000, max: 5000 },
  { label: "$5k – $10k", min: 5000, max: 10000 },
  { label: "$10k+", min: 10000, max: null },
] as const;

export const ratingOptions = [4.5, 4] as const;

const inStock = {
  label: "In stock · ships today",
  tone: "success",
  icon: "lucide:circle-check",
} as const;

const freight = {
  label: "White-glove freight",
  tone: "info",
  icon: "lucide:truck",
} as const;

const consignment = {
  label: "Certified consignment",
  tone: "info",
  icon: "lucide:badge-check",
} as const;

const factory = {
  label: "Custom factory order",
  tone: "warning",
  icon: "lucide:clock",
} as const;

const baseProducts: CatalogProduct[] = [
  {
    id: "x2d",
    sku: "LP-HB-8199",
    category: "digital",
    dispatch: "in-stock",
    group: "camera",
    badge: inStock,
    brand: "Hasselblad",
    name: "X2D 100C Medium Format",
    blurb:
      "100 MP BSI CMOS, 5.5-stop stabilisation and a tilting touch display.",
    specs: ["100 MP", "16-bit RAW", "8 fps"],
    rating: 4.9,
    reviews: 38,
    price: 8199,
    lease: 274,
    icon: "lucide:camera",
  },
  {
    id: "p9570",
    sku: "LP-EP-9570",
    category: "printers",
    dispatch: "freight",
    group: "print",
    badge: freight,
    brand: "Epson",
    name: 'SureColor P9570 44" Fine Art',
    blurb:
      "10-colour UltraChrome PRO6 pigment set with advanced media handling.",
    specs: ['44" roll', "10 inks", "Spectro"],
    rating: 4.7,
    reviews: 17,
    price: 6695,
    lease: 223,
    icon: "lucide:printer",
  },
  {
    id: "summilux",
    sku: "LP-LC-3514",
    category: "lenses",
    dispatch: "factory-order",
    group: "camera",
    badge: factory,
    brand: "Leica",
    name: "Summilux-M 35 mm f/1.4 ASPH",
    blurb:
      "Compact aspherical design with floating-element focus and classic rendering.",
    specs: ["f/1.4", "35 mm", "320 g"],
    rating: 5,
    reviews: 52,
    price: 5995,
    lease: 200,
    icon: "lucide:aperture",
  },
  {
    id: "pro4100",
    sku: "LP-CN-4100",
    category: "printers",
    dispatch: "freight",
    group: "print",
    badge: freight,
    brand: "Canon",
    name: 'imagePROGRAF PRO-4100 44"',
    blurb:
      "Eleven-colour LUCIA PRO II pigment system for gallery-grade reproduction.",
    specs: ['44" roll', "11 inks", "Wi-Fi"],
    rating: 4.8,
    reviews: 21,
    price: 4995,
    lease: 167,
    icon: "lucide:printer",
  },
  {
    id: "pro11",
    sku: "LP-PP-PR011",
    category: "lighting",
    dispatch: "freight",
    group: "lighting",
    badge: {
      label: "Studio master power",
      tone: "success",
      icon: "lucide:zap",
    },
    brand: "Profoto",
    name: "Pro-11 2400 AirTTL Generator",
    blurb:
      "Studio-grade power with 11 stops of range and ultra-short flash durations.",
    specs: ["2400 Ws", "AirTTL", "11 stops"],
    rating: 5,
    reviews: 19,
    price: 17495,
    lease: 583,
    icon: "lucide:zap",
  },
  {
    id: "hahnemuhle-308",
    sku: "LP-HH-308",
    category: "substrates",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Hahnemühle",
    name: "Photo Rag 308 g Roll",
    blurb:
      '44" × 30 m archival roll. 100% pure white cotton for fine-art reproduction.',
    specs: ["308 gsm", "100% cotton", "Matte"],
    rating: 4.9,
    reviews: 73,
    price: 289,
    lease: 0,
    icon: "lucide:scroll-text",
  },
  {
    id: "colorchecker",
    sku: "LP-CB-CCST",
    category: "colorimeters",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Calibrite",
    name: "ColorChecker Studio",
    blurb:
      "All-in-one spectrophotometer for print, display and scanner custom ICC profiles.",
    specs: ["RGB profiling", "Display + print", "USB"],
    rating: 4.8,
    reviews: 15,
    price: 599,
    lease: 0,
    icon: "lucide:swatch-book",
  },
  {
    id: "arri-47",
    sku: "LP-AR-47T18",
    category: "lenses",
    dispatch: "factory-order",
    group: "camera",
    badge: {
      label: "Cinema allocation",
      tone: "warning",
      icon: "lucide:clock",
    },
    brand: "ARRI",
    name: "Signature Prime 47 mm T1.8",
    blurb:
      "Large-format cine prime with velvety roll-off and a soft-edged character.",
    specs: ["T1.8", "47 mm", "LF"],
    rating: 4.9,
    reviews: 12,
    price: 24950,
    lease: 832,
    icon: "lucide:aperture",
  },
  {
    id: "phase-one-iq4",
    sku: "LP-PO-150AC",
    category: "digital",
    dispatch: "consignment",
    group: "camera",
    badge: consignment,
    brand: "Phase One",
    name: "IQ4 150 MP Achromatic",
    blurb:
      "Monochrome digital back with no IR cut filter. Studio consignment, warranty remaining.",
    specs: ["150 MP", "Achromatic", "Infinity"],
    rating: 5,
    reviews: 9,
    price: 41600,
    lease: 1387,
    icon: "lucide:scan",
  },
  {
    id: "b10x",
    sku: "LP-PF-B10XP",
    category: "lighting",
    dispatch: "in-stock",
    group: "lighting",
    badge: inStock,
    brand: "Profoto",
    name: "B10X Plus Duo Kit",
    blurb:
      "500 Ws power with 3,250 continuous modelling light and travel case.",
    specs: ["500 Ws", "Bluetooth AirX", "Li-ion"],
    rating: 4.9,
    reviews: 34,
    price: 4795,
    lease: 160,
    icon: "lucide:lightbulb",
  },
  {
    id: "leica-m11",
    sku: "LP-LC-M11M",
    category: "digital",
    dispatch: "consignment",
    group: "camera",
    badge: consignment,
    brand: "Leica",
    name: "M11 Monochrom",
    blurb: "Body only, 87 actuations. Bench certified with a 4-year warranty.",
    specs: ["60 MP", "B&W sensor", "Body only"],
    rating: 4.9,
    reviews: 14,
    price: 7450,
    lease: 248,
    icon: "lucide:camera",
  },
  {
    id: "canson-platine",
    sku: "LP-CN-PL310",
    category: "substrates",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Canson",
    name: "Platine Fibre Rag 310 g",
    blurb:
      "True darkroom baryta replacement on 100% cotton platinum substrate.",
    specs: ["310 gsm", "Baryta", "Acid-free"],
    rating: 4.9,
    reviews: 46,
    price: 165,
    lease: 0,
    icon: "lucide:scroll-text",
  },
  {
    id: "hasselblad-907x",
    sku: "LP-HB-907X",
    category: "digital",
    dispatch: "in-stock",
    group: "camera",
    badge: inStock,
    brand: "Hasselblad",
    name: "907X 50C Kit",
    blurb: "Modular 50 MP medium-format back with a compact CFV body.",
    specs: ["50 MP", "CFV II", "Modular"],
    rating: 4.7,
    reviews: 26,
    price: 6399,
    lease: 213,
    icon: "lucide:camera",
  },
  {
    id: "dcp-t220",
    sku: "LP-BR-T220",
    category: "printers",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Brother",
    name: "DCP-T220 Ink Tank 3-in-1",
    blurb:
      "Refillable ink-tank printer, scanner and copier for high-volume proofing.",
    specs: ["Print · Scan · Copy", "6,500 pp", "USB"],
    rating: 4.6,
    reviews: 64,
    price: 189,
    lease: 16,
    icon: "lucide:printer",
    image: "/img/prod-01.png",
    imageAlt:
      "Brother DCP-T220 ink tank printer with a colour print in the tray",
  },
  {
    id: "ink-advantage",
    sku: "LP-HP-IA2874",
    category: "printers",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "HP",
    name: "Ink Advantage All-in-One",
    blurb:
      "Compact wireless all-in-one for studio proof sheets and everyday office work.",
    specs: ["Wi-Fi", "4800 dpi", "Auto-off"],
    rating: 4.4,
    reviews: 41,
    price: 129,
    lease: 11,
    icon: "lucide:printer",
    image: "/img/prod-02.png",
    imageAlt: "HP Ink Advantage all-in-one printer, front view",
  },
  {
    id: "pixma-g4010",
    sku: "LP-CN-G4010",
    category: "printers",
    dispatch: "freight",
    group: "print",
    badge: freight,
    brand: "Canon",
    name: "PIXMA G4010 MegaTank",
    blurb:
      "Wireless 4-in-1 with refillable MegaTank bottles and an automatic document feeder.",
    specs: ["4-in-1", "Fax + ADF", "Wi-Fi"],
    rating: 4.8,
    reviews: 21,
    price: 249,
    lease: 21,
    icon: "lucide:printer",
    image: "/img/prod-03.png",
    imageAlt: "Canon PIXMA G4010 MegaTank printer with four ink bottles",
  },
  {
    id: "ecotank",
    sku: "LP-EP-ET4850",
    category: "printers",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Epson",
    name: "EcoTank Photo All-in-One",
    blurb:
      "Cartridge-free tank system with a flatbed scanner lid for bound documents and photos.",
    specs: ["EcoTank", "Flatbed", "Wi-Fi"],
    rating: 4.7,
    reviews: 17,
    price: 399,
    lease: 33,
    icon: "lucide:printer",
    image: "/img/prod-04.png",
    imageAlt: "Epson EcoTank all-in-one printer with its scanner lid open",
  },
  {
    id: "leica-noctilux",
    sku: "LP-LC-N095",
    category: "lenses",
    dispatch: "consignment",
    group: "camera",
    badge: consignment,
    brand: "Leica",
    name: "Noctilux-M 50 mm f/0.95",
    blurb:
      "Ultra-fast manual prime. Certified consignment with bench-verified focus.",
    specs: ["f/0.95", "50 mm", "M-mount"],
    rating: 4.9,
    reviews: 8,
    price: 10495,
    lease: 350,
    icon: "lucide:aperture",
  },
  {
    id: "p7570",
    sku: "LP-EP-7570",
    category: "printers",
    dispatch: "in-stock",
    group: "print",
    badge: inStock,
    brand: "Epson",
    name: 'SureColor P7570 24" Proofing Engine',
    blurb: "Compact 10-colour pigment engine with the same droplet kinetics as the 44-inch flagship.",
    specs: ['24" roll', "10 inks", "Spectro-ready"],
    rating: 4.9,
    reviews: 19,
    price: 4695,
    lease: 155,
    icon: "lucide:printer",
  },
];

// Every card gets a photo. Products without their own picture borrow one from
// public/img until real photography is added — set `image` on the product to override.
const stockImages = [
  "/img/prod-01.png",
  "/img/prod-02.png",
  "/img/prod-03.png",
  "/img/prod-04.png",
];

let borrowed = 0;
export const catalogProducts: CatalogProduct[] = baseProducts.map((p) =>
  p.image
    ? p
    : {
        ...p,
        image: stockImages[borrowed++ % stockImages.length],
        imageAlt: `${p.brand} ${p.name}`,
      },
);

/** Generic category pages: /products/<slug>. "scope" limits which products are listed. */
export const categoryPages: Record<
  string,
  { label: string; description: string; scope: CatalogCategory[] }
> = {
  lenses: { label: "Lenses", description: "Cine primes, large-format and rangefinder optics, bench-verified before dispatch.", scope: ["lenses"] },
  lighting: { label: "Lighting", description: "Studio generators, monolights and power packs for controlled, repeatable light.", scope: ["lighting"] },
  audio: { label: "Audio", description: "Shotgun, lavalier and field recording equipment for production sound.", scope: [] },
  tripods: { label: "Tripods & Rigging", description: "Carbon-fibre supports, fluid heads and rigging for steady capture.", scope: [] },
  printers: { label: "Printers", description: "Fine-art pigment printers and desktop systems with custom ICC profiles.", scope: ["printers"] },
  "paper-ink": { label: "Paper & Ink", description: "Archival cotton rag, baryta substrates and pigment inks.", scope: ["substrates"] },
  accessories: { label: "Accessories", description: "Colorimeters, spectrophotometers and calibration tools.", scope: ["colorimeters"] },
};

/** Extra words people search for that don't appear in product text. */
export const categoryKeywords: Record<CatalogCategory, string> = {
  digital: "camera cameras digital back backs medium format body mirrorless",
  lenses: "lens lenses optic optics glass prime",
  printers: "printer printers print printing inkjet scanner copier",
  substrates: "paper papers rag baryta media roll sheet ink inks substrate",
  lighting: "light lights lighting strobe flash studio generator",
  colorimeters: "colorimeter spectrophotometer calibration profile accessory accessories",
};
