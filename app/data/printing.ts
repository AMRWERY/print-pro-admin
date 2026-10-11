import type {
  CostLine,
  PrintChoice,
  PrintConfig,
  PrintSize,
  PrintSubstrate,
} from "~/types/printing";

// Lab price list. There is no pricing service yet, so the configurator prices from this file.

export const MAX_FILE_MB = 500;
export const FILE_PATTERN = /\.(tiff?|psd|pdf|jpe?g|png)$/i;
export const FILE_ACCEPT = [
  ".tif",
  ".tiff",
  ".psd",
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
];

export const sizes: PrintSize[] = [
  {
    value: "a4",
    label: "A4 Standard",
    w: 8.3,
    h: 11.7,
    note: '8.3" × 11.7" (210 × 297 mm)',
    price: 42,
  },
  {
    value: "a3p",
    label: "A3+ Super Proof",
    w: 13,
    h: 19,
    note: '13" × 19" (329 × 483 mm)',
    price: 74,
  },
  {
    value: "a2",
    label: "A2 Exhibition",
    w: 16.5,
    h: 23.4,
    note: '16.5" × 23.4" (420 × 594 mm)',
    price: 112,
  },
  {
    value: "24x36",
    label: '24" × 36" Gallery Master',
    w: 24,
    h: 36,
    note: "610 × 914 mm",
    price: 168,
  },
  {
    value: "36x54",
    label: '36" × 54" Museum Wall',
    w: 36,
    h: 54,
    note: "914 × 1372 mm",
    price: 280,
  },
  {
    value: "custom",
    label: "Custom Roll Dimension",
    note: 'Continuous up to 44" width',
    price: 0,
  },
];

/** Custom sizes are priced by area. */
export const CUSTOM_PER_SQFT = 9;
export const CUSTOM_MAX_WIDTH = 44;

export const substrates: PrintSubstrate[] = [
  {
    value: "hahnemuhle",
    name: "Hahnemühle Photo Rag",
    spec: "308gsm · 100% cotton rag",
    tag: "Museum archival",
    description:
      "Smooth velvety surface with a muted chalk-white finish. Outstanding pictorial depth and an exceptional dMax of 2.45. Wilhelm longevity verified.",
    detail: "ISO 9706 acid-free · standard base",
    delta: 0,
    duplex: true,
    tint: "none",
  },
  {
    value: "canson",
    name: "Canson Platine Fibre Rag",
    spec: "310gsm · baryta satin",
    tag: "Baryta satin",
    description:
      "Pure 100% cotton rag with a darkroom baryta coating. Deep, rich blacks and a satin sheen recreate traditional silver gelatin prints.",
    detail: "True darkroom feel",
    delta: 18,
    duplex: true,
    tint: "contrast(1.06) saturate(1.04)",
  },
  {
    value: "ilford",
    name: "Ilford Gold Fibre Gloss",
    spec: "310gsm · warm baryta",
    tag: "Warm baryta",
    description:
      "Traditional barium sulphate coating on an alpha-cellulose base. Subtle cream warmth, ideal for classic cinematic tones.",
    detail: "Subtle cream base",
    delta: 14,
    duplex: false,
    tint: "sepia(0.12) saturate(1.05)",
  },
  {
    value: "awagami",
    name: "Awagami Bamboo Washi",
    spec: "250gsm · Japanese washi",
    tag: "Natural matte",
    description:
      "Ecological handcrafted Japanese mulberry and bamboo fibre. Organic fibre texture with soft contrast and exceptional tactile appeal.",
    detail: "Handcrafted heritage",
    delta: 22,
    duplex: false,
    tint: "sepia(0.18) contrast(0.95)",
  },
];

export const inks: PrintChoice[] = [
  {
    value: "pro12",
    name: "12-Color UltraChrome PRO12",
    description:
      "Full-spectrum pigment set with dedicated Violet, Orange and Green channels and a triple-level Light Gray for smooth colour gradients and 99% Pantone coverage.",
    note: "Colorimetric verification included",
    price: 0,
  },
  {
    value: "mono",
    name: "Monochrome Carbon Piezography",
    description:
      "Pure monochromatic carbon shade formulations. Seven dilutions of carbon black give photographic gradation and zero metamerism.",
    note: "+$28 calibration fee",
    price: 28,
  },
];

export const bindings: PrintChoice[] = [
  {
    value: "loose",
    name: "None / Loose Sheet",
    description: "Interleaved glassine",
    price: 0,
  },
  {
    value: "screwpost",
    name: "Screw-Post Portfolio",
    description: "Anodized titanium",
    price: 65,
  },
  {
    value: "linen",
    name: "Linen Hardcover Folio",
    description: "Hand-sewn spine",
    price: 120,
  },
  {
    value: "clamshell",
    name: "Museum Clamshell Box",
    description: "Archival buckram",
    price: 145,
  },
];

/** Priced per print. */
export const edges: PrintChoice[] = [
  {
    value: "trim",
    name: "Clean Trim / Rotary Blade Flush Cut",
    description:
      "Exact calibrated edge cut with zero micro-fraying. Standard archival practice for floating frame mounts.",
    price: 18,
  },
  {
    value: "deckled",
    name: "Hand-Deckled Feathered Edges",
    description:
      "Hand-torn along water-conditioned fibres for an authentic deckled fine-art rim on pure rag paper.",
    price: 18,
  },
  {
    value: "lacquer",
    name: "Archival Protective Lacquer Spray",
    description:
      "Aerosol sealing without gloss shift. Shields against UV radiation and atmospheric yellowing.",
    price: 14.5,
  },
  {
    value: "border",
    name: '100% Rag Acid-Free 2" White Border',
    description:
      "Generates an integrated white border around the image for safe museum hinge mounting and dry mounting.",
    price: 0,
  },
];

export const dispatches: PrintChoice[] = [
  {
    value: "courier",
    name: "Armored Courier Delivery",
    description:
      "Climate-regulated express dispatch, flat-packed inside hermetically sealed Baltic birch crate. Full transit insurance included.",
    note: "2–3 business days transit",
    price: 25,
  },
  {
    value: "pickup",
    name: "Atelier Dock Pickup",
    description:
      "Direct collection from the cleanroom release gate at our NYC bench, immediately after 24-hour print degassing.",
    note: "Complimentary",
    price: 0,
  },
];

export const volumeTiers = [
  { from: 10, rate: 0.18 },
  { from: 5, rate: 0.1 },
];

export const FLAT_FEES = { preflight: 24, crate: 18 };
export const DUPLEX_SUPPLEMENT = 0.6;

export const defaultConfig = (): PrintConfig => ({
  copies: 1,
  size: "24x36",
  customW: 24,
  customL: 36,
  substrate: "hahnemuhle",
  ink: "pro12",
  duplex: "single",
  binding: "loose",
  edges: ["trim"],
  dispatch: "courier",
});

export const volumeRate = (copies: number) =>
  volumeTiers.find((t) => copies >= t.from)?.rate ?? 0;

const round = (n: number) => Math.round(n * 100) / 100;

export const sizeOf = (cfg: PrintConfig) => {
  const preset = sizes.find((s) => s.value === cfg.size) ?? sizes[3]!;
  if (preset.value !== "custom")
    return { ...preset, w: preset.w!, h: preset.h! };
  return {
    ...preset,
    w: cfg.customW,
    h: cfg.customL,
    price: round((cfg.customW * cfg.customL * CUSTOM_PER_SQFT) / 144),
  };
};

/** Everything that costs money, as lines for the itemised summary. */
export const priceConfig = (cfg: PrintConfig) => {
  const size = sizeOf(cfg);
  const paper =
    substrates.find((s) => s.value === cfg.substrate) ?? substrates[0]!;
  const ink = inks.find((i) => i.value === cfg.ink) ?? inks[0]!;
  const binding = bindings.find((b) => b.value === cfg.binding) ?? bindings[0]!;
  const dispatch =
    dispatches.find((d) => d.value === cfg.dispatch) ?? dispatches[0]!;
  const edgePer = cfg.edges.reduce(
    (sum, v) => sum + (edges.find((e) => e.value === v)?.price ?? 0),
    0,
  );
  const duplex =
    cfg.duplex === "double" ? round(size.price * DUPLEX_SUPPLEMENT) : 0;

  const unit = round(size.price + paper.delta + edgePer + duplex);
  const prints = round(unit * cfg.copies);
  const discount = round(prints * volumeRate(cfg.copies));

  const lines: CostLine[] = [
    {
      key: "prints",
      label: `${cfg.size === "custom" ? `${cfg.customW}″ × ${cfg.customL}″ custom` : size.label} × ${cfg.copies} · ${paper.name}`,
      amount: prints,
    },
  ];
  if (discount)
    lines.push({
      key: "volume",
      label: `Volume discount (−${Math.round(volumeRate(cfg.copies) * 100)}%)`,
      amount: -discount,
    });
  lines.push({
    key: "preflight",
    label: "Metrological preflight & colour profiling",
    amount: FLAT_FEES.preflight,
  });
  if (ink.price) lines.push({ key: "ink", label: ink.name, amount: ink.price });
  if (binding.price)
    lines.push({ key: "binding", label: binding.name, amount: binding.price });
  lines.push({
    key: "crate",
    label: "Archival curing & hermetic crate",
    amount: FLAT_FEES.crate,
  });
  if (dispatch.price)
    lines.push({
      key: "dispatch",
      label: dispatch.name,
      amount: dispatch.price,
    });

  const total = round(lines.reduce((sum, l) => sum + l.amount, 0));
  return { lines, total, unit, size, paper };
};

/** Working days at the bench before the order can leave. */
export const productionDays = (cfg: PrintConfig) =>
  3 +
  (cfg.duplex === "double" ? 1 : 0) +
  (cfg.edges.includes("lacquer") ? 1 : 0) +
  (cfg.copies >= 10 ? 1 : 0);