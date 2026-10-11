import type {
  AtelierProfile,
  AuditLogEntry,
  CompanionProduct,
  ReceivingDock,
  RegistryItem,
  RequisitionOrder,
} from "~/types/account";

export const defaultAtelierProfile: AtelierProfile = {
  id: "LP-VANCE-BER",
  name: "Amr Mohamed",
  title: "Lead Conservator & Master Printer",
  affiliation: "Metropolitan Archival Wing & Galerie Max Hetzler",
  tierTag: "CURATORIAL TIER 01 // BERLIN-NYC AXIS",
  tierName: "Print atelier & lab",
  metrologyId: "LP-VANCE-BER",
  avatarUrl: "/img/user-01.png",
  escrowLimit: 45000,
  escrowAvailable: 12450,
  auditSyncTime: "Today 09:15 CET",
  proofDrift: "ΔE 0.32 Proof Drift",
  cleanroomDock: "Station 04 (Berlin)",
  cleanroomSpecs: "ISO 5 / 45% Relative Humidity",
  securityAuth: "FIDO2 / YubiKey SE",
  securityStatus: "Cryptographic Sign Valid",
  deltaEAvg: 0.45,
  chamberHumidity: 45,
  chamberPressure: 100,
};

export const defaultOrders: RequisitionOrder[] = [
  {
    id: "#LP-948201",
    crateId: "CRATE #LP-948201",
    title:
      "Hasselblad X2D 100C + Epson SureColor P9570 44\" + Hahnemühle Photo Rag 308g (6 Rolls)",
    status: "in-transit",
    statusLabel: "IN-TRANSIT",
    badgeLabel: "ARMORED AIR CARGO",
    waybill: "LH-CARGO-VP185-26",
    dispatchedFrom: "Curatorial Vault MUC - 26 OCT",
    destination: "NYC MHT DOCK 4B",
    traceTelemetry: "8-Point Telemetry: ΔE < 0.186 (Nominal)",
    flight: {
      code: "LH-400",
      route: "FRA -> JFK",
      altitude: "36,000 FT",
      cargoTemp: "19.2°C (VAULT REGULATED)",
      humidity: "42%",
      status: "ON-TIME EN ROUTE",
      currentStageIndex: 2,
      stages: [
        "BER Studio Cleared",
        "TXL Customs",
        "Mid-Atlantic In Flight",
        "JFK Dock 4B",
      ],
      gForce: "0.02G Safe",
    },
    amount: 18242.2,
    items: [
      {
        name: "Hasselblad X2D 100C Medium Format",
        thumb: "/img/prod-01.png",
        sku: "LP-HB-8199",
        quantity: 1,
      },
      {
        name: "Epson SureColor P9570 44\" Fine Art",
        thumb: "/img/prod-03.png",
        sku: "LP-EP-9570",
        quantity: 1,
      },
      {
        name: "Hahnemühle Photo Rag 308g (6 Rolls)",
        thumb: "/img/prod-02.png",
        sku: "LP-HH-308",
        quantity: 6,
      },
    ],
  },
  {
    id: "#LP-883109",
    title:
      "Profoto Pro-11 2400 AirTTL Generator + 2x ProHead Plus Studio Flashheads",
    status: "delivered",
    statusLabel: "DELIVERED & BENCH-VERIFIED",
    badgeLabel: "BENCH-VERIFIED",
    date: "18 Oct 2024",
    serial: "PR-11-2400-AH21",
    dispatchedFrom: "Berlin Atelier for 4 x 15 Apt",
    benchVerified: "ΔE < 0.20 Fluor Temp Steadied",
    amount: 17495.0,
    items: [
      {
        name: "Profoto Pro-11 2400 AirTTL Generator",
        thumb: "/img/prod-01.png",
        sku: "LP-PP-PR011",
        quantity: 1,
      },
      {
        name: "ProHead Plus Studio Flashhead",
        thumb: "/img/prod-04.png",
        sku: "LP-PP-HEAD",
        quantity: 2,
      },
    ],
  },
  {
    id: "#LP-810442",
    title:
      "Leica Summilux-M 35mm f/1.4 ASPH + Eizo ColorEdge CG319X 4K DCI Reference Display",
    status: "archived",
    statusLabel: "ARCHIVED / SETTLED",
    date: "02 Sep 2024",
    calibrationLog:
      "Metrology Collimation Pass MTF 98.4% Calibration Log: PENL-DIODE-D3F-9031",
    amount: 11890.0,
    items: [
      {
        name: "Leica Summilux-M 35mm f/1.4 ASPH",
        thumb: "/img/prod-02.png",
        sku: "LP-LC-3514",
        quantity: 1,
      },
      {
        name: "Eizo ColorEdge CG319X 4K DCI Reference Display",
        thumb: "/img/prod-04.png",
        sku: "LP-EZ-319X",
        quantity: 1,
      },
    ],
  },
];

export const highVolumeExtraOrders: RequisitionOrder[] = [
  {
    id: "#LP-948190",
    title: "Phase One IQ4 150MP Achromatic Back + Rodenstock 32mm Prime",
    status: "in-transit",
    statusLabel: "IN-TRANSIT",
    badgeLabel: "HIGH-VALUATION ESCROW",
    waybill: "LX-CARGO-ZUR-441",
    dispatchedFrom: "Zurich Precision Vault",
    destination: "Berlin Metrology Station 04",
    amount: 49590.0,
    items: [
      {
        name: "Phase One IQ4 150MP Achromatic",
        thumb: "/img/prod-08.png",
        sku: "LP-PO-150AC",
      },
    ],
  },
  {
    id: "#LP-947992",
    title: "Epson UltraChrome PRO12 Complete Bulk Lot (24 Cartridges)",
    status: "in-transit",
    statusLabel: "IN-TRANSIT",
    badgeLabel: "DIRECT LAB RUN",
    waybill: "DB-EXPRESS-DE-881",
    dispatchedFrom: "Hamburg Media Hub",
    destination: "NYC Archival Airlock",
    amount: 4780.0,
    items: [
      {
        name: "UltraChrome PRO12 700ml Full Set",
        thumb: "/img/prod-09.png",
        sku: "LP-EP-INK12",
      },
    ],
  },
];

export const defaultRegistryItems: RegistryItem[] = [
  {
    id: "prod-05",
    name: "Calibrite ColorChecker Studio Spectrophotometer",
    category: "Spectral Metrology",
    statusBadge: "IN STOCK",
    specNotes: "Calibration Bench // DIN 755 12647 Compliance",
    price: 599.0,
    image: "/img/prod-05.png",
    icon: "lucide:swatch-book",
    units: 1,
  },
  {
    id: "hasselblad-xcd-38",
    name: "Hasselblad XCD 38mm f/2.5 V Optical Prime",
    category: "Optics Registry",
    statusBadge: "2 UNITS ALLOCATED • UNDER EARLY",
    specNotes: "Leaf Shutter 1/2000s Sync // Central Lens Shutter",
    price: 3699.0,
    image: "/img/prod-01.png",
    icon: "lucide:aperture",
    units: 2,
  },
  {
    id: "canson-platine-44",
    name: "Canson Infinity Platine Fibre Rag 310gsm 44\" Roll",
    category: "Rag Substrate",
    statusBadge: "BATCH #2024-11 • 100% COTTON",
    specNotes: "No OBA // 30m x 44\" // Archival Provenance",
    price: 295.0,
    image: "/img/prod-06.png",
    icon: "lucide:scroll-text",
    units: 1,
  },
];

export const defaultReceivingDocks: ReceivingDock[] = [
  {
    id: "dock-nyc-4b",
    name: "Metropolitan Archival Wing • Dock 4B",
    code: "NYC-MHT-4B",
    typeBadge: "PRIMARY PRESENT > DE",
    clearanceBadge: "ISO 5 DOCK CLEARING",
    address:
      "1000 5th Avenue, New York, NY 10028 — Climate-Controlled Port — ATN: Amr Mohamed Lab-812",
    climateSpecs: "Direct Climate Airlock Access (Bay 12)",
    securityClearance: "LEVEL 4 CONSERVATOR",
    telemetry: "19.2°C / 44.8% RH",
    bondedAgent: "#DE-992",
    isPrimary: true,
  },
  {
    id: "dock-ber-main",
    name: "Galerie Max Hetzler • Main Atelier",
    code: "BER-KREUZ-01",
    typeBadge: "SECONDARY ATELIER",
    clearanceBadge: "CLEANROOM TIER 4",
    address:
      "Köpenicker Str. 148, 10997 Berlin, Germany • Optical ingest bay",
    climateSpecs: "Regulated optical clean dock",
    securityClearance: "DE-METRX-4",
    telemetry: "18.5°C / 43.1% RH",
    bondedAgent: "#BER-841",
    isPrimary: false,
  },
];

export const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: "audit-01",
    title: "BENCH COLLIMATION CERTIFIED",
    timestamp: "09:43 CET",
    summary:
      "Laser interferometry MTF test passed for Hasselblad HC-X2D-9941. MTF curve uploaded to vault.",
    hash: "SHA-256: 9aaFF...ee1F",
    category: "qa",
    severity: "verified",
  },
  {
    id: "audit-02",
    title: "ESCROW DEPOSIT CONFIRMED",
    timestamp: "08:14 CET",
    summary:
      "Credit Transfer DCR-99374 executed via Valuta Swift MARX. $45,000 credit line unlocked.",
    hash: "TX REF: CR-EUPR-V100-YANCE",
    category: "escrow",
    severity: "nominal",
  },
  {
    id: "audit-03",
    title: "SECURITY TOKEN ROTATED",
    timestamp: "YESTERDAY",
    summary:
      "Hardware FIDO2 YubiKey authenticated session from IP 147.15.89.7 (Berlin Max Hetzler).",
    hash: "FIDO2 LEVEL 3 / SHA256-VAULT",
    category: "security",
    severity: "action",
  },
  {
    id: "audit-04",
    title: "SPECTRAL DRIFT RE-CALIBRATED",
    timestamp: "24 OCT",
    summary:
      "Epson P9570 spectrophotometer baseline shifted by 0.12% ΔE. Compensatory profile applied.",
    hash: "PROFILE: L&P-ICC-ENG20-PLATIN",
    category: "metrology",
    severity: "verified",
  },
];

export const defaultCompanionProducts: CompanionProduct[] = [
  {
    id: "prod-09",
    name: "UltraChrome PRO12 700ml Full Set",
    tag: "FOR EPSON P9570",
    badge: "CONSUMABLES • INKS",
    description:
      "12-channel pigment inkset with violet channel for 99% Pantone gamut.",
    price: 2390.0,
    image: "/img/prod-09.png",
    icon: "lucide:palette",
  },
  {
    id: "ilford-gold-fibre",
    name: "Ilford Galerie Gold Fibre Gloss 310gsm",
    tag: "BARYTA ARCHIVAL MEDIA",
    badge: "ARCHIVAL MEDIA",
    description:
      "Traditional darkroom papier baryta coating with true gelatin sheets.",
    price: 245.0,
    image: "/img/prod-06.png",
    icon: "lucide:scroll-text",
  },
  {
    id: "pelican-air-1615",
    name: "Pelican Air 1615 Travel Case (Hermetic)",
    tag: "TRANSPORT & VAULT",
    badge: "ARMORED TRANSPORT",
    description:
      "Custom laser-cut foam insert for Hasselblad X2D & 3 prime lenses.",
    price: 395.0,
    image: "/img/prod-07.png",
    icon: "lucide:briefcase",
  },
  {
    id: "phase-one-rodenstock",
    name: "Phase One XT Rodenstock 32mm",
    tag: "FLAGSHIP OPTICS",
    badge: "OPTICAL BENCH GRADE",
    description:
      "Zero-distortion architectural tilt/shift metrology prime.",
    price: 11990.0,
    image: "/img/prod-08.png",
    icon: "lucide:camera",
  },
];

export const complianceSections = [
  {
    title: "CLEANROOM CERTIFICATION",
    body: "Certified Class 100 / ISO 5 laminar air filtration chamber operated under federal standard 209E. Monitored for particulates < 0.1µm.",
    code: "CERT-IS05-2024-L&P",
  },
  {
    title: "METROLOGY LAB",
    body: "ISO 12647-7 proof verification powered by X-Rite spectrophotometers. D50 daylight illumination over 2000 lux compliance index.",
    code: "METRO-QA #9841P-B",
  },
  {
    title: "LOGISTICS & VAULT",
    body: "Hermetic optical vaults kept at constant 18°C / 45% relative humidity. Global shock-damped transport with telemetry tracking.",
    code: "VAULT-LOG: CB-1043",
  },
  {
    title: "LEGAL & ARCHIVAL TRACE",
    body: "Archival Provenance, ERA Information, Strict Quarantine Terms, Re-Optical Acquisition.",
    code: "PRIVACY & METROLOGY TELEMETRY",
  },
];
