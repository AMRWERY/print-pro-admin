import { cameraProducts } from "~/data/cameras";
import { catalogProducts, categoryOptions } from "~/data/catalog";
import { defaultCompanionProducts, defaultRegistryItems } from "~/data/account";
import { featured } from "~/data/home";
import type { DetailedProduct, ProductDetail } from "~/types/product";

// Registry and companion items from the account area, so they can be carted like any product.
const accountProducts: DetailedProduct[] = [
  ...defaultRegistryItems.map<DetailedProduct>((r) => ({
    id: r.id,
    sku: `LP-REG-${r.id}`,
    group: "camera",
    badge: { label: "Registry allocation", tone: "info", icon: "lucide:check" },
    brand: "Atelier Registry",
    name: r.name,
    blurb: r.specNotes,
    specs: ["Atelier allocated", "Bench QA"],
    rating: 5,
    reviews: 1,
    price: r.price,
    lease: 0,
    icon: r.icon || "lucide:box",
    image: r.image,
  })),
  ...defaultCompanionProducts.map<DetailedProduct>((c) => ({
    id: c.id,
    sku: `LP-COMP-${c.id}`,
    group: "print",
    badge: { label: c.badge, tone: "success", icon: "lucide:check" },
    brand: "Lumen & Press",
    name: c.name,
    blurb: c.description,
    specs: [c.tag, "Certified"],
    rating: 5,
    reviews: 1,
    price: c.price,
    lease: 0,
    icon: c.icon || "lucide:box",
    image: c.image,
  })),
];

// The made-to-order print from the configurator; its price and options live on the cart line.
accountProducts.push({
  id: "custom-print",
  sku: "LP-PRINT-CUSTOM",
  group: "print",
  badge: { label: "Made to order", tone: "info", icon: "lucide:printer" },
  brand: "Lumen & Press Lab",
  name: "Custom archival print",
  blurb: "Museum-grade pigment print, configured in the printing service.",
  specs: ["Archival pigment", "Spectro-verified"],
  rating: 5,
  reviews: 1,
  price: 0,
  lease: 0,
  icon: "lucide:printer",
  image: "/img/hero-img.png",
});

const base: DetailedProduct[] = [...catalogProducts, ...cameraProducts, ...featured];

export const allProducts: DetailedProduct[] = [
  ...base,
  ...accountProducts.filter((a) => !base.some((b) => b.id === a.id)),
];

/** Product lookup across the catalogue, the cameras page and the home page. */
export const findProduct = (id: string): DetailedProduct | undefined =>
  allProducts.find((p) => p.id === id);

const richDetails: Record<string, ProductDetail> = {
  p9570: {
    subtitle: "Fine Art & Commercial Proofing Production Engine",
    crumbs: [
      { label: "Index", to: "/" },
      { label: "Print & lab systems", to: "/products/printers" },
      { label: "Large-format roll plotters", to: "/products/printers" },
      { label: "44″ production" },
      { label: "Epson SureColor P9570" },
    ],
    compareAt: 6995,
    stockLabel: "In stock · NYC warehouse",
    leaseNote: "Studio equipment lease from $220 / mo",
    gallery: [
      { label: "Lab studio", src: "/img/hero-img.png", alt: "Epson large-format printer in a fine-art print studio" },
      { label: "Front", icon: "lucide:printer" },
      { label: "Print head", icon: "lucide:scan" },
      { label: "Ink bay", icon: "lucide:droplets" },
      { label: "Roll feed", icon: "lucide:scroll-text" },
      { label: "Control panel", icon: "lucide:monitor" },
    ],
    packages: [
      { id: "std", label: "Standard production engine", note: "44″ printer, stand, full ink set and dual roll adapter.", delta: 0 },
      { id: "spectro", label: "Engine + inline spectrophotometer", note: "Adds an automated profiling unit for hands-free colour targets.", delta: 2995 },
      { id: "master", label: "Master printmaker lab bundle", note: "Engine, spectrophotometer, a starter media pack and a calibration service day.", delta: 5795 },
    ],
    assurance: [
      "White-glove crated delivery and installation",
      "Pre-shipment bench calibration report",
      "Custom ICC profile for your first media roll",
    ],
    keyFacts: [
      { label: "Print width", value: '44″' },
      { label: "Resolution", value: "2400 × 1200 dpi" },
      { label: "Ink channels", value: "10" },
      { label: "Min. droplet", value: "3.5 pl" },
      { label: "Ink capacity", value: "700 ml" },
      { label: "Connectivity", value: "10 GbE · USB 3" },
    ],
    feature: {
      eyebrow: "Atelier engine notes",
      title: "Micro-piezo purity without optical compromise",
      body: "An uncompromised fine-art engine engineered for master editions. Printmakers who require tactile paper depth, instant black transitions and spectral neutrality under museum tungsten and D50 standard lighting.",
      cards: [
        { eyebrow: "01 / Nozzle coverage", title: "2.64-in. precision core", body: "Ten independent channels with 800+ nozzles per channel deliver variable droplets down to 3.5 picolitres for smooth tonal gradients.", metric: "Raw head density: 42.0 lp/mm" },
        { eyebrow: "02 / Gradient revolution", title: "Zero ink-switch black lines", body: "Unlike legacy large-format printers, the engine features dedicated channels for Photo Black and Matte Black, so switching media needs no purge cycle.", metric: "Flush time: 0 seconds · zero ink dump" },
        { eyebrow: "03 / Spectral metrology", title: "Violet & orange expanded gamut", body: "The addition of high-purity violet and deep orange pigments expands colour reach by 99% of Pantone Plus Solid coated references.", metric: "Delta-E variance: 190 / ΔE-HDR" },
      ],
    },
    benchmark: {
      title: "Optical density (Dmax) benchmarking",
      note: "Measured on a calibrated spectrophotometer with polarisation filter.",
      columns: ["Media substrate", "Base colour", "Weight (gsm)", "Dmax (K)", "Profile status"],
      rows: [
        ["Hahnemühle Photo Rag Baryta", "Warm white", "315", "2.81", "Certified ICC bundle"],
        ["Canson Platine Fibre Rag", "Bright white", "310", "2.78", "Certified ICC bundle"],
        ["Epson Premium Luster", "Bright white", "260", "2.45", "Factory profile"],
        ["Awagami Kozo Thick", "Natural", "110", "1.82", "Custom ICC on request"],
      ],
    },
    specGroups: [
      { title: "Print engine & drop kinetics", rows: [
        { label: "Printhead architecture", value: "MicroTFP 10-channel" },
        { label: "Nozzle density", value: "800 nozzles per channel" },
        { label: "Maximum resolution", value: "2400 × 1200 dpi" },
        { label: "Droplet size", value: "3.5 pl variable" },
        { label: "Cartridge capacity", value: "350 ml / 700 ml" },
      ] },
      { title: "Media feed & substrate handling", rows: [
        { label: "Max roll width", value: '44″ (1118 mm)' },
        { label: "Media thickness", value: "0.08 – 1.5 mm" },
        { label: "Roll paper cutter", value: "Auto, dual-edge" },
        { label: "Borderless printing", value: "Supported, selected media" },
        { label: "Sheet feed", value: "Manual, rear" },
      ] },
      { title: "Connectivity & processing", rows: [
        { label: "Interfaces", value: "10 GbE, USB 3.0" },
        { label: "Internal memory", value: "4 GB + 320 GB storage" },
        { label: "Driver support", value: "macOS, Windows" },
        { label: "Colour management", value: "ICC, ColorSync" },
        { label: "Network", value: "IPv4 / IPv6" },
      ] },
      { title: "Chassis & lab operating conditions", rows: [
        { label: "Dimensions", value: '75.2 × 36 × 49 in' },
        { label: "Net weight", value: "227 kg (500 lb)" },
        { label: "Power", value: "100–240 V, 50/60 Hz" },
        { label: "Operating temperature", value: "10 – 35 °C" },
        { label: "Operating humidity", value: "20 – 80% non-condensing" },
      ] },
    ],
    documents: [
      { title: "P9570 hardware spec sheet", meta: "PDF · 2.4 MB · rev 4.0", icon: "lucide:file-text" },
      { title: "D50 / 5000K lighting norms", meta: "PDF · 1.1 MB · 18 pages", icon: "lucide:sun" },
      { title: "Hahnemühle & Canson ICCs", meta: "ZIP · 12.8 MB · 14 profiles", icon: "lucide:swatch-book" },
      { title: "Wilhelm lightfastness audit", meta: "PDF · 3.0 MB · 2023", icon: "lucide:shield-check" },
    ],
    reviews: {
      score: 4.94,
      count: 31,
      distribution: [27, 3, 1, 0, 0],
      items: [
        { author: "Atelier Etienne", location: "Paris, FR", badge: "Verified purchase", title: "The elimination of black switching paid for the engine in four months", body: "We run 44-inch Baryta rolls in the morning and switch to Awagami Kozo handmade sheets in the afternoon. On the P9000, the switch was a never-ending ink purge. On the P9570, the transition is instantaneous and clean.", date: "Mar 2025" },
        { author: "Kaneda Editions", location: "Tokyo, JP", badge: "Verified purchase", title: "Spectral proofing gives us accuracy that beats our scanning tables", body: "The integrated spectrophotometer produced our G7 proofing in one pass. Colour variation is under ΔE 0.8 across 54 prints of one 10-print edition, with calibration kept in the lab.", date: "Jan 2025" },
      ],
    },
    qa: [
      { q: "Can the P9570 handle thick Hahnemühle Baryta rolls without head strikes?", a: "Yes. The platen gap adjusts to 2.6 mm and the vacuum feed keeps 315 gsm baryta flat. Run the supplied media profile for best results." },
      { q: "Does the spectrophotometer package need a separate computer?", a: "No. The inline unit profiles from the printer's own panel and stores the result on the device. A computer is only needed to export the profile." },
    ],
    related: ["hahnemuhle-308", "canson-platine", "colorchecker", "pro4100"],
  },
};

/** Details for any product. Rich content where we have it, a sensible default otherwise. */
export const getProductDetail = (product: DetailedProduct): ProductDetail => {
  const rich = richDetails[product.id];
  if (rich) return rich;

  const categoryLabel =
    categoryOptions.find(
      (o) => o.key === (product as { category?: string }).category,
    )?.label ?? "Instruments";

  return {
    subtitle: product.blurb,
    crumbs: [
      { label: "Index", to: "/" },
      { label: "Optical & print apparatus", to: "/products" },
      { label: categoryLabel, to: "/products" },
      { label: product.name },
    ],
    stockLabel: product.badge.label,
    leaseNote: product.lease ? `Studio equipment lease from $${product.lease} / mo` : undefined,
    gallery: [
      product.image
        ? { label: "Product", src: product.image, alt: product.imageAlt ?? product.name }
        : { label: "Product", icon: product.icon },
    ],
    packages: [
      { id: "std", label: "Standard configuration", note: "Product as listed, bench-verified before dispatch.", delta: 0 },
      { id: "care", label: "With extended studio care", note: "Adds a multi-year coverage plan with loaner support.", delta: Math.round(product.price * 0.08) },
    ],
    assurance: [
      "Bench-verified before dispatch",
      "Calibration report included",
      "Direct line to a certified technician",
    ],
    keyFacts: product.specs.map((s, i) => ({ label: `Spec ${i + 1}`, value: s })),
    specGroups: [
      { title: "Key specifications", rows: product.specs.map((s, i) => ({ label: `Spec ${i + 1}`, value: s })) },
    ],
    documents: [],
    qa: [
      { q: "Is this item tested before it ships?", a: "Yes. Every item is checked on our bench and ships with its calibration notes." },
      { q: "Can I lease this product?", a: "Lease terms are shown beside the price when available. Contact the tech concierge for a quote." },
    ],
    related: catalogProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 4)
      .map((p) => p.id),
  };
};
