import type { Product } from "~/types/home";

export const promoItems = [
  "Free priority delivery on heavy freight over $2,000",
  "Certified Hasselblad, Leica & Epson Pro partner",
  "Pro calibration services",
];

export const categories = [
  {
    label: "Cameras",
    to: "/products/cameras",
    terms: ["camera","cameras"],
    icon: "lucide:camera",
    blurb: "Medium-format, cine, mirrorless and film bodies.",
    meta: "240 instruments",
  },
  {
    label: "Lenses",
    to: "/products/lenses",
    terms: ["lens","lenses"],
    icon: "lucide:aperture",
    blurb: "Cine primes, anamorphic, ultra-fast glass.",
    meta: "312 objectives",
  },
  {
    label: "Lighting",
    to: "/products/lighting",
    terms: ["light","lights","lighting"],
    icon: "lucide:lightbulb",
    blurb: "Strobe generators, bi-color monolights.",
    meta: "96 fixtures",
  },
  {
    label: "Audio",
    to: "/products/audio",
    terms: ["audio","microphone","microphones","mic"],
    icon: "lucide:mic",
    blurb: "Shotgun, lavalier, wireless and field recorders.",
    meta: "84 capsules",
  },
  {
    label: "Tripods & Rigging",
    to: "/products/tripods",
    terms: ["tripod","tripods","rigging"],
    icon: "lucide:move-3d",
    blurb: "Carbon-fibre legs, fluid heads, gimbals.",
    meta: "58 supports",
  },
  {
    label: "Printers",
    to: "/products/printers",
    terms: ["printer","printers"],
    icon: "lucide:printer",
    blurb: 'Fine-art 24" to 64" pigment printers.',
    meta: "32 platforms",
  },
  {
    label: "Paper & Ink",
    to: "/products/paper-ink",
    terms: ["paper","papers","ink","inks"],
    icon: "lucide:scroll-text",
    blurb: "Cotton rag, baryta, UltraChrome pigment sets.",
    meta: "410 media",
  },
  {
    label: "Accessories",
    to: "/products/accessories",
    terms: ["accessory","accessories"],
    icon: "lucide:cable",
    blurb: "Spectros, hard cases, filters and mounts.",
    meta: "690 parts",
  },
];

export const partners = [
  "Hasselblad",
  "Leica Camera",
  "Epson Pro Graphics",
  "Canon imagePROGRAF",
  "Phase One",
  "Profoto",
  "Manfrotto",
];

export const heroStats = [
  { value: "60 MP", label: "Sensor-ready optics" },
  { value: "100%", label: "Archival pigments" },
  { value: "ΔE < 1", label: "Profiled output" },
];

export const featuredFilters = [
  { key: "all", label: "All Pro Gear" },
  { key: "camera", label: "Camera Systems" },
  { key: "print", label: "Print & Lab" },
  { key: "lighting", label: "Studio Lighting" },
] as const;

export const featured: Product[] = [
  {
    id: "x2d",
    group: "camera",
    badge: {
      label: "In stock · ships today",
      tone: "success",
      icon: "lucide:circle-check",
    },
    brand: "Hasselblad Optics",
    name: "X2D 100C Medium Format",
    blurb:
      "100 MP BSI CMOS, 5.5-stop stabilisation and a tilting touch display.",
    specs: ["100 MP", "16-bit RAW", "8 fps"],
    rating: 4.9,
    reviews: 38,
    price: 8199,
    lease: 274,
    icon: "lucide:camera",
    image: "/img/prod-01.png",
    imageAlt:
      "Brother DCP-T220 ink tank printer with a colour print in the tray",
  },
  {
    id: "dcp-t220",
    group: "print",
    badge: {
      label: "In stock · ships today",
      tone: "success",
      icon: "lucide:circle-check",
    },
    brand: "Brother Print",
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
    group: "print",
    badge: {
      label: "Direct allocation",
      tone: "info",
      icon: "lucide:package-check",
    },
    brand: "HP Print",
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
    id: "pro11",
    group: "lighting",
    badge: {
      label: "Master studio power",
      tone: "success",
      icon: "lucide:zap",
    },
    brand: "Profoto Studio",
    name: "Pro-11 2400 AirTTL Generator",
    blurb:
      "Studio-grade power with 11 stops of range and ultra-short flash durations.",
    specs: ["2400 Ws", "AirTTL", "11 stops"],
    rating: 4.9,
    reviews: 29,
    price: 17495,
    lease: 583,
    icon: "lucide:zap",
    image: "/img/prod-01.png",
    imageAlt:
      "Brother DCP-T220 ink tank printer with a colour print in the tray",
  },
  {
    id: "pixma-g4010",
    group: "print",
    badge: { label: "White-glove freight", tone: "info", icon: "lucide:truck" },
    brand: "Canon Print Systems",
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
    group: "print",
    badge: {
      label: "Pre-order · 5 units",
      tone: "warning",
      icon: "lucide:clock",
    },
    brand: "Epson Pro Graphics",
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
];

export const arrivals = [
  {
    id: "leica-m11",
    tag: "Bench certified · 4-yr",
    name: "Leica M11 Monochrom",
    note: "Body only · 87 actuations",
    price: 7450,
    action: "Reserve body",
    icon: "lucide:camera",
    image: "/img/prod-04.png",
    imageAlt: "Epson EcoTank all-in-one printer with its scanner lid open",
  },
  {
    id: "hahnemuhle",
    tag: "Limited archival batch",
    name: 'Hahnemühle Photo Rag Baryta 44" Roll',
    note: "315 gsm · 12 m roll",
    price: 289,
    action: "Add roll",
    icon: "lucide:scroll-text",
    image: "/img/prod-04.png",
    imageAlt: "Epson EcoTank all-in-one printer with its scanner lid open",
  },
  {
    id: "phase-one",
    tag: "Studio consignment",
    name: "Phase One IQ4 150 MP Achromatic",
    note: "Digital back · warranty remaining",
    price: 41600,
    action: "Inquire bench",
    icon: "lucide:scan",
    image: "/img/prod-04.png",
    imageAlt: "Epson EcoTank all-in-one printer with its scanner lid open",
  },
];

export const valueProps = [
  {
    icon: "lucide:truck",
    title: "White-glove freight",
    body: "Climate-controlled delivery with in-studio unboxing for heavy instruments.",
  },
  {
    icon: "lucide:shield-check",
    title: "5-yr extended studio care",
    body: "Coverage including loaner bodies, printheads and on-site recalibration.",
  },
  {
    icon: "lucide:clipboard-check",
    title: "Pre-flight bench QA",
    body: "Every instrument is tested and signed off before it leaves our bench.",
  },
  {
    icon: "lucide:headset",
    title: "Master tech direct line",
    body: "Talk to certified technicians, not a call-centre script.",
  },
];

export const trust = [
  {
    icon: "lucide:shield",
    title: "3-year studio warranty",
    body: "Complete coverage on camera systems and printers.",
  },
  {
    icon: "lucide:repeat",
    title: "Fair market trade-in",
    body: "Instant optical benchmarking and trade credit on used gear.",
  },
  {
    icon: "lucide:badge-check",
    title: "Authorized pro dealer",
    body: "Direct from Hasselblad, Leica, Canon and Epson.",
  },
  {
    icon: "lucide:sparkles",
    title: "Cleanroom print QA",
    body: "Spectrophotometer-verified output on every fine-art print.",
  },
];

export const footerColumns = [
  {
    title: "Cameras & Optics",
    links: [
      "Digital medium format",
      "ICC profiling",
      "Medium format film",
      "Cine lenses",
    ],
  },
  {
    title: "Print & Lab",
    links: [
      "Fine-art printers",
      "Pigment inks",
      "Archival paper",
      "Calibration",
    ],
  },
  {
    title: "Services",
    links: [
      "Bench calibration",
      "Trade-in",
      "Studio financing",
      "Shipping & freight",
    ],
  },
];
