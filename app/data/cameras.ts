import type {
  CameraAvailability,
  CameraProduct,
  CameraSub,
  Flagship,
} from "~/types/cameras";

export const categoryTabs = [
  { label: "Cameras & Backs", to: "/products/cameras" },
  { label: "Lenses", to: "/products/lenses" },
  { label: "Lighting", to: "/products/lighting" },
  { label: "Audio", to: "/products/audio" },
  { label: "Tripods", to: "/products/tripods" },
  { label: "Printers", to: "/products/printers" },
  { label: "Paper & Ink", to: "/products/paper-ink" },
  { label: "Accessories", to: "/products/accessories" },
];

export const cameraStats = [
  {
    label: "Sensor tolerance",
    value: "±0.002 mm",
    note: "PrintPro-calibrated, certified",
  },
  {
    label: "Dynamic range",
    value: "15.3 stops",
    note: "16-bit A/D conversion",
  },
  {
    label: "Colour engine",
    value: "HNCS / IQ RAW",
    note: "Custom ICC on request",
  },
  {
    label: "Dispatch assurance",
    value: "0-hour zero",
    note: "Cleanroom-bench verified",
  },
];

export const subcategories: {
  key: CameraSub;
  label: string;
  blurb: string;
  icon: string;
}[] = [
  {
    key: "backs",
    label: "Digital Backs",
    blurb:
      "Modular Phase One, Hasselblad and Leaf backs for technical and studio bodies.",
    icon: "lucide:scan",
  },
  {
    key: "mirrorless",
    label: "MF Mirrorless",
    blurb: "Handheld 100 MP mirrorless medium-format bodies.",
    icon: "lucide:camera",
  },
  {
    key: "cine",
    label: "Cine Platforms",
    blurb: "Large-format cinema cameras and production kits.",
    icon: "lucide:clapperboard",
  },
  {
    key: "achromatic",
    label: "Achromatic / IR",
    blurb: "Monochrome and IR-sensitive sensors without colour filters.",
    icon: "lucide:contrast",
  },
  {
    key: "pro35",
    label: "35 mm Pro High-Res",
    blurb: "Full-frame bodies for hybrid stills and motion.",
    icon: "lucide:aperture",
  },
  {
    key: "technical",
    label: "Technical Systems",
    blurb: "View-camera and shift/stitch bodies for architecture.",
    icon: "lucide:move-3d",
  },
];

export const authorizedBrands = [
  "Hasselblad",
  "Phase One",
  "Leica",
  "Fujifilm GFX",
  "ARRI",
  "Alpa",
];

export const flagships: Flagship[] = [
  {
    id: "x2d-bundle",
    tag: "Flagship · in stock",
    tone: "accent",
    sku: "LP-HB-X2D100",
    name: "Hasselblad X2D 100C Studio Bundle",
    price: 10499,
    blurb:
      "100 MP BSI medium-format body with 5.5-stop stabilisation, calibrated at our bench and supplied with two XCD lenses and a studio tether kit.",
    specs: [
      { label: "Sensor", value: "44×33 mm BSI" },
      { label: "Resolution", value: "100 MP" },
      { label: "Stabilisation", value: "5.5 stops" },
      { label: "Capture", value: "16-bit 3FR" },
    ],
    action: "Acquire system",
    secondary: "Compare specs",
    icon: "lucide:camera",
  },
  {
    id: "iq4-achro",
    tag: "Full 645 · ultra resolution",
    tone: "warning",
    sku: "LP-PO-150AC",
    name: "Phase One IQ4 150MP Achromatic Back",
    price: 37990,
    blurb:
      "True monochrome sensor with no colour filter array. Infinity platform, 150 MP, certified consignment with warranty remaining.",
    specs: [
      { label: "Sensor", value: "53.4×40 mm" },
      { label: "Resolution", value: "150 MP" },
      { label: "Dynamic range", value: "15 stops" },
      { label: "Platform", value: "Infinity" },
    ],
    action: "Request white-glove consult",
    icon: "lucide:scan",
  },
];

const inStock = {
  label: "Immediate dispatch",
  tone: "success",
  icon: "lucide:circle-check",
} as const;
const certified = {
  label: "Bench certified",
  tone: "info",
  icon: "lucide:badge-check",
} as const;
const preorder = {
  label: "Pre-order",
  tone: "warning",
  icon: "lucide:clock",
} as const;

const cam = (
  p: Omit<CameraProduct, "group" | "icon" | "lease" | "blurb"> &
    Partial<Pick<CameraProduct, "lease" | "blurb" | "icon">>,
): CameraProduct => ({
  group: "camera",
  icon: "lucide:camera",
  lease: Math.round(p.price / 30),
  blurb: "",
  ...p,
});

export const cameraProducts: CameraProduct[] = [
  cam({
    id: "x2d",
    sku: "LP-HB-8199",
    sub: "mirrorless",
    sensor: "44×33 mm",
    mount: "XCD",
    megapixels: 100,
    availability: "immediate",
    badge: inStock,
    brand: "Hasselblad",
    name: "X2D 100C Medium Format",
    blurb: "100 MP BSI CMOS with a 3.6-inch tilting touch display.",
    specs: ["100 MP", "16-bit RAW", "IBIS"],
    rating: 4.9,
    reviews: 38,
    price: 8199,
  }),
  cam({
    id: "gfx100ii",
    sku: "LP-FJ-GFX2",
    sub: "mirrorless",
    sensor: "44×33 mm",
    mount: "GF",
    megapixels: 102,
    availability: "immediate",
    badge: inStock,
    brand: "Fujifilm",
    name: "GFX100 II Body",
    blurb: "102 MP medium format with fast phase-detect autofocus.",
    specs: ["102 MP", "8 stops IBIS", "GF mount"],
    rating: 4.8,
    reviews: 29,
    price: 7499,
  }),
  cam({
    id: "iq4-150",
    sku: "LP-PO-IQ4150",
    sub: "backs",
    sensor: "53.4×40 mm",
    mount: "Phase One XF",
    megapixels: 150,
    availability: "certified",
    badge: certified,
    brand: "Phase One",
    name: "IQ4 150MP Digital Back",
    blurb: "Full 645 BSI sensor with Infinity platform. Studio consignment.",
    specs: ["150 MP", "Infinity", "16-bit"],
    rating: 5,
    reviews: 9,
    price: 41990,
    icon: "lucide:scan",
  }),
  cam({
    id: "iq4-achro",
    sku: "LP-PO-150AC",
    sub: "achromatic",
    sensor: "53.4×40 mm",
    mount: "Phase One XF",
    megapixels: 150,
    availability: "certified",
    badge: certified,
    brand: "Phase One",
    name: "IQ4 150MP Achromatic",
    blurb: "No colour filter array, no IR cut. True monochrome capture.",
    specs: ["150 MP", "Achromatic", "No IR cut"],
    rating: 5,
    reviews: 6,
    price: 37990,
    icon: "lucide:scan",
  }),
  cam({
    id: "cfv100c",
    sku: "LP-HB-CFV100",
    sub: "backs",
    sensor: "44×33 mm",
    mount: "V System",
    megapixels: 100,
    availability: "immediate",
    badge: inStock,
    brand: "Hasselblad",
    name: "CFV 100C Digital Back",
    blurb: "Adds 100 MP to classic V-system and technical bodies.",
    specs: ["100 MP", "V System", "USB-C"],
    rating: 4.8,
    reviews: 11,
    price: 7299,
  }),
  cam({
    id: "alexa35",
    sku: "LP-AR-ALX35",
    sub: "cine",
    sensor: "Super 35",
    mount: "LPL",
    megapixels: 17,
    availability: "preorder",
    badge: preorder,
    brand: "ARRI",
    name: "ALEXA 35 Production Set",
    blurb: "4.6K Super 35 cinema camera with 17 stops of dynamic range.",
    specs: ["4.6K", "17 stops", "LPL"],
    rating: 4.9,
    reviews: 7,
    price: 64500,
    icon: "lucide:clapperboard",
  }),
  cam({
    id: "m11-mono",
    sku: "LP-LC-M11M",
    sub: "achromatic",
    sensor: "36×24 mm",
    mount: "Leica M",
    megapixels: 60,
    availability: "certified",
    badge: certified,
    brand: "Leica",
    name: "M11 Monochrom",
    blurb: "Body only, 87 actuations. Bench certified with warranty.",
    specs: ["60 MP", "B&W sensor", "Body only"],
    rating: 4.9,
    reviews: 14,
    price: 7450,
  }),
  cam({
    id: "alpa-12tc",
    sku: "LP-AL-12TC",
    sub: "technical",
    sensor: "Multi-format",
    mount: "Alpa",
    megapixels: 0,
    availability: "immediate",
    badge: inStock,
    brand: "Alpa",
    name: "12 TC Compact Body",
    blurb: "Compact technical camera for architectural shift and stitch work.",
    specs: ["Shift / tilt", "Alpa mount", "Compact"],
    rating: 4.7,
    reviews: 5,
    price: 5480,
    icon: "lucide:move-3d",
  }),
  cam({
    id: "sl3",
    sku: "LP-LC-SL3",
    sub: "pro35",
    sensor: "36×24 mm",
    mount: "Leica L",
    megapixels: 60,
    availability: "immediate",
    badge: inStock,
    brand: "Leica",
    name: "SL3 Full-Frame",
    blurb: "60 MP full-frame with a 5.76 M-dot EVF and 8K video.",
    specs: ["60 MP", "8K video", "L-mount"],
    rating: 4.7,
    reviews: 22,
    price: 6995,
  }),
  cam({
    id: "907x",
    sku: "LP-HB-907X",
    sub: "mirrorless",
    sensor: "44×33 mm",
    mount: "XCD",
    megapixels: 50,
    availability: "immediate",
    badge: inStock,
    brand: "Hasselblad",
    name: "907X 50C Kit",
    blurb: "Modular 50 MP medium-format back with a compact CFV body.",
    specs: ["50 MP", "CFV II", "Modular"],
    rating: 4.7,
    reviews: 26,
    price: 6399,
  }),
  cam({
    id: "gfx50s",
    sku: "LP-FJ-GFX50",
    sub: "mirrorless",
    sensor: "44×33 mm",
    mount: "GF",
    megapixels: 51,
    availability: "immediate",
    badge: inStock,
    brand: "Fujifilm",
    name: "GFX 50S II Body",
    blurb: "Entry to medium format with 51 MP and in-body stabilisation.",
    specs: ["51 MP", "IBIS", "GF mount"],
    rating: 4.6,
    reviews: 31,
    price: 3999,
  }),
  cam({
    id: "cambo-actus",
    sku: "LP-CM-ACMV",
    sub: "technical",
    sensor: "Multi-format",
    mount: "Cambo",
    megapixels: 0,
    availability: "immediate",
    badge: inStock,
    brand: "Cambo",
    name: "Actus-MV Technical Body",
    blurb: "Modular view camera for rise, fall and shift work.",
    specs: ["Rise / fall", "Modular", "Back mount"],
    rating: 4.6,
    reviews: 8,
    price: 4750,
    icon: "lucide:move-3d",
  }),
];

export const subLabel = Object.fromEntries(
  subcategories.map((s) => [s.key, s.label]),
) as Record<CameraSub, string>;

export const availabilityOptions: { key: CameraAvailability; label: string }[] =
  [
    { key: "immediate", label: "Immediate dispatch" },
    { key: "certified", label: "Certified consignment" },
    { key: "preorder", label: "Pre-order allocation" },
  ];

export const resolutionTiers = [
  { label: "100 MP+", min: 100 },
  { label: "60 MP+", min: 60 },
  { label: "45 MP+", min: 45 },
] as const;

export const inventorySortOptions = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "resolution", label: "Resolution" },
] as const;

export const matrix = {
  columns: ["44×33 mm crop (100 MP)", "53.4×40 mm full 645 (150 MP)"],
  rows: [
    { label: "Active sensor surface area", values: ["1,452 mm²", "2,136 mm²"] },
    { label: "True B/W colour depth", values: ["16-bit", "16-bit"] },
    {
      label: "Studio strobe lead sync",
      values: ["Focal-plane, up to 1/250 s", "Leaf shutter, full speed range"],
    },
    {
      label: "Diffraction onset limit",
      values: ["Approx. f/11", "Approx. f/16"],
    },
    {
      label: "Primary workflow suitability",
      values: [
        "Commercial, fashion, editorial",
        "Fine-art, museum, archival reproduction",
      ],
    },
  ],
};

export const useCases = [
  {
    title: "Commercial Fashion",
    body: "Recommended: Hasselblad X2D 100C. Fast tethered capture with leaf-shutter lens options.",
    icon: "lucide:shirt",
  },
  {
    title: "Fine-Art & Museum",
    body: "Recommended: Phase One IQ4 150MP. Maximum resolution and tonal range for reproduction.",
    icon: "lucide:landmark",
  },
  {
    title: "Architectural Heritage",
    body: "Recommended: Alpa 12 TC with a 100 MP back. Shift and stitch with minimal distortion.",
    icon: "lucide:building-2",
  },
  {
    title: "Motion / Stills Hybrid",
    body: "Recommended: Leica SL3 or ARRI ALEXA 35. One kit for both stills and moving image.",
    icon: "lucide:clapperboard",
  },
];

export const faqs = [
  {
    q: "What is the difference between 16-bit Hasselblad Natural Colour Solution and standard RAW?",
    a: "Natural Colour Solution applies a consistent, measured colour profile to 16-bit capture so skin tones and product colours land close to reference without heavy correction. Standard RAW leaves those interpretation choices to your software.",
  },
  {
    q: "How do PrintPro bench-test and calibrate camera systems before dispatch?",
    a: "Each body is checked for sensor alignment, shutter accuracy and tether stability on our bench, then profiled against a reference target. You receive the calibration report with the system.",
  },
  {
    q: "Can commercial studios lease or rent systems for single productions?",
    a: "Yes. Lease terms are shown on each product, and short-term rentals can be arranged for single productions. Contact the tech concierge to scope the dates and accessories.",
  },
  {
    q: "How do leaf-shutter lenses compare to focal-plane shutters for strobe synchronisation?",
    a: "Leaf shutters sit inside the lens and synchronise with flash at any shutter speed, which helps when balancing strobes with ambient light. Focal-plane shutters limit sync to a maximum speed but allow a wider range of lenses.",
  },
];
