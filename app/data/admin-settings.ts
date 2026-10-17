import type {
  CardMethod,
  CarrierRow,
  CurrencyCode,
  EscortTier,
  RoundingMode,
  Settings,
  SettingsResponse,
  TaxRow,
} from "~/types/admin/settings";

// Demo settings book. When the app has a backend this file goes away and
// server/api/admin/settings/* proxies the real service.

export const currencyCodes: CurrencyCode[] = ["EGP", "EUR", "CHF", "USD", "GBP"];
const roundingModes: RoundingMode[] = ["cent", "unit", "five"];
const escortTiers: EscortTier[] = ["standard", "dedicated", "armored", "diplomatic"];
const cardMethods: CardMethod[] = ["wallet", "sepa", "zero-liability", "local"];

const defaults = (): Settings => ({
  store: {
    legalName: "Lumen & Press Optical Printworks",
    registration: "CHE-492.918.203-MWST",
    address: "Limmatquai 104, 8001 Zürich, Switzerland",
    timezone: "Africa/Cairo",
    storefront: "live",
    maintenanceMessage: "We're calibrating the vault and will be back shortly.",
  },
  contact: {
    email: "concierge@lumenpress.art",
    phone: "+41 44 214 88 00",
    emergencyPhone: "+41 79 555 01 23",
    pgpKey: "0x4DF2B13F98A19B4C",
  },
  currency: { base: "EGP", secondary: "EUR", tertiary: "USD", syncMinutes: 60, rounding: "cent", markup: 0.5 },
  tax: {
    vatId: "EU372089418",
    ossConsolidation: true,
    zeroRating: true,
    rows: [
      { id: "tx-eg", jurisdiction: "Egypt", mechanism: "Domestic VAT", standard: 14, reduced: 5, active: true },
      { id: "tx-de", jurisdiction: "Germany", mechanism: "EU one-stop shop", standard: 19, reduced: 7, active: true },
      { id: "tx-fr", jurisdiction: "France", mechanism: "EU one-stop shop", standard: 20, reduced: 5.5, active: true },
      { id: "tx-us", jurisdiction: "United States", mechanism: "State nexus, sales tax", standard: 0, reduced: 0, active: false },
    ],
  },
  payments: {
    wireEnabled: true,
    bankName: "Deutsche Bank Luxembourg SA",
    iban: "DE89370400440532013000",
    bic: "DEUTDEFFXXX",
    escrowLimit: 250000,
    cardEnabled: true,
    cardMethods: ["wallet", "sepa", "zero-liability"],
    escrowThreshold: 15000,
  },
  shipping: {
    carriers: [
      { id: "cr-brink", name: "Brink's fine art transit", description: "Dual-guard GPS tracking with continuous accelerometer and shock telemetry.", fee: 200, enabled: true },
      { id: "cr-crate", name: "Cleanroom vacuum crate", description: "Mylar-sealed ISO class 5 packaging with desiccant and shock indicators.", fee: 120, enabled: true },
      { id: "cr-free", name: "Free consignment basket", description: "Automatic freight concession above the VIP basket threshold.", fee: 0, enabled: false },
    ],
    escortTier: "armored",
    freeThreshold: 2500,
  },
  orders: { prefix: "LP-2026-", graceMinutes: 60, maxUnverified: 15000, clearanceHours: 48 },
  inventory: { lowStockDefault: 5, reorderBufferDays: 14, vaultSyncMinutes: 15, autoQuarantine: true, barcodeVerify: true },
  security: { requireFido2: true, physicalPresence: true, sessionTimeoutMinutes: 15, ipAllowlist: "196.218.0.0/16\n41.32.10.0/24" },
  integrations: { webhookUrl: "https://hooks.lumenpress.art/telemetry", slackAlerts: true },
  email: {
    smtpHost: "smtp.postmarkapp.com",
    smtpPort: 587,
    fromName: "Lumen & Press",
    fromAddress: "orders@lumenpress.art",
    transmitProofs: true,
    signatoryAlerts: true,
  },
  seo: {
    defaultTitle: "Lumen & Press — photography and print equipment",
    defaultDescription: "Cameras, lenses, printers and archival substrates for studios and institutions.",
    schemaOrg: true,
    sitemap: true,
  },
  ergonomics: { haptic: true, highContrast: false },
});

let settings = defaults();
let updatedAt = "2026-10-30T09:12:00.000Z";
let updatedBy = "E. Vanderbilt";
let secretLast4 = "9F2C";
let secretRotatedAt = "2026-09-14T08:00:00.000Z";

export const dnsRecords: SettingsResponse["dns"] = [
  { type: "DKIM", host: "pm._domainkey.lumenpress.art", target: "k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOC…", ok: true },
  { type: "SPF", host: "lumenpress.art", target: "v=spf1 include:spf.mtasv.net -all", ok: true },
  { type: "DMARC", host: "_dmarc.lumenpress.art", target: "v=DMARC1; p=reject; pct=100; rua=…", ok: true },
];

export const readSettings = (): SettingsResponse => ({
  settings: structuredClone(settings),
  updatedAt,
  updatedBy,
  secretLast4,
  secretRotatedAt,
  dns: dnsRecords,
});

// --- Validation ---

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bool = (v: unknown) => v === true;
const num = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
  typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,24}$/;
const IPV4_CIDR = /^(\d{1,3})(\.\d{1,3}){3}(\/(\d|[12]\d|3[0-2]))?$/;

export const cidrValid = (line: string) =>
  IPV4_CIDR.test(line) && line.split("/")[0]!.split(".").every((o) => Number(o) <= 255);

/** Checks the whole settings object. Returns null when anything is out of range or malformed. */
export const validateSettings = (body: unknown): Settings | null => {
  const b = (body ?? {}) as Record<string, any>;
  const g = (k: string) => (b[k] ?? {}) as Record<string, any>;

  // --- store & contact ---
  const legalName = str(g("store").legalName, 120);
  const address = str(g("store").address, 200);
  const timezone = str(g("store").timezone, 60);
  const storefront = pick(g("store").storefront, ["live", "maintenance"] as const);
  const email = str(g("contact").email, 120).toLowerCase();
  const phone = str(g("contact").phone, 24);
  const emergencyPhone = str(g("contact").emergencyPhone, 24);
  if (legalName.length < 2 || address.length < 3 || !timezone || !storefront) return null;
  if (!EMAIL.test(email) || !PHONE.test(phone) || (emergencyPhone && !PHONE.test(emergencyPhone))) return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch {
    return null;
  }

  // --- currency ---
  const c = g("currency");
  const base = pick(c.base, currencyCodes);
  const secondary = pick(c.secondary, currencyCodes);
  const tertiary = pick(c.tertiary, currencyCodes);
  const syncMinutes = num(c.syncMinutes, 5, 1440);
  const rounding = pick(c.rounding, roundingModes);
  const markup = num(c.markup, 0, 10);
  if (!base || !secondary || !tertiary || syncMinutes === null || !rounding || markup === null) return null;

  // --- tax ---
  const t = g("tax");
  const taxRows: TaxRow[] = [];
  for (const r of Array.isArray(t.rows) ? t.rows.slice(0, 20) : []) {
    const standard = num(r?.standard, 0, 100);
    const reduced = num(r?.reduced, 0, 100);
    const jurisdiction = str(r?.jurisdiction, 60);
    if (standard === null || reduced === null || !jurisdiction || reduced > standard) return null;
    taxRows.push({ id: str(r.id, 20) || `tx-${taxRows.length}`, jurisdiction, mechanism: str(r.mechanism, 60), standard, reduced, active: bool(r.active) });
  }

  // --- payments ---
  const p = g("payments");
  const iban = str(p.iban, 34).replace(/\s+/g, "").toUpperCase();
  const bic = str(p.bic, 11).toUpperCase();
  const escrowLimit = num(p.escrowLimit, 0, 100_000_000);
  const escrowThreshold = num(p.escrowThreshold, 0, 100_000_000);
  if (escrowLimit === null || escrowThreshold === null) return null;
  if (bool(p.wireEnabled) && (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) || !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic))) return null;
  const methods = (Array.isArray(p.cardMethods) ? p.cardMethods : []).filter((m: unknown): m is CardMethod => cardMethods.includes(m as CardMethod));

  // --- shipping ---
  const s = g("shipping");
  const carriers: CarrierRow[] = [];
  for (const r of Array.isArray(s.carriers) ? s.carriers.slice(0, 12) : []) {
    const fee = num(r?.fee, 0, 1_000_000);
    const name = str(r?.name, 80);
    if (fee === null || !name) return null;
    carriers.push({ id: str(r.id, 20) || `cr-${carriers.length}`, name, description: str(r.description, 200), fee, enabled: bool(r.enabled) });
  }
  const escortTier = pick(s.escortTier, escortTiers);
  const freeThreshold = num(s.freeThreshold, 0, 100_000_000);
  if (!escortTier || freeThreshold === null) return null;

  // --- orders & inventory ---
  const o = g("orders");
  const prefix = str(o.prefix, 16).toUpperCase();
  const graceMinutes = num(o.graceMinutes, 0, 1440);
  const maxUnverified = num(o.maxUnverified, 0, 100_000_000);
  const clearanceHours = num(o.clearanceHours, 1, 720);
  if (!/^[A-Z0-9][A-Z0-9-]{0,15}$/.test(prefix) || graceMinutes === null || maxUnverified === null || clearanceHours === null) return null;

  const i = g("inventory");
  const lowStockDefault = num(i.lowStockDefault, 0, 100_000);
  const reorderBufferDays = num(i.reorderBufferDays, 0, 365);
  const vaultSyncMinutes = num(i.vaultSyncMinutes, 1, 1440);
  if (lowStockDefault === null || reorderBufferDays === null || vaultSyncMinutes === null) return null;

  // --- security & integrations & email ---
  const sec = g("security");
  const sessionTimeoutMinutes = num(sec.sessionTimeoutMinutes, 5, 480);
  const ips = str(sec.ipAllowlist, 2000).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (sessionTimeoutMinutes === null || ips.length > 50 || ips.some((l) => !cidrValid(l))) return null;

  const webhookUrl = str(g("integrations").webhookUrl, 200);
  if (webhookUrl && !/^https:\/\/[^\s/]+\.[^\s]+$/.test(webhookUrl)) return null;

  const m = g("email");
  const smtpPort = num(m.smtpPort, 1, 65535);
  const fromAddress = str(m.fromAddress, 120).toLowerCase();
  const smtpHost = str(m.smtpHost, 120).toLowerCase();
  if (smtpPort === null || !EMAIL.test(fromAddress) || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(smtpHost)) return null;

  const seo = g("seo");
  const ergo = g("ergonomics");

  return {
    store: { legalName, registration: str(g("store").registration, 60), address, timezone, storefront, maintenanceMessage: str(g("store").maintenanceMessage, 200) },
    contact: { email, phone, emergencyPhone, pgpKey: str(g("contact").pgpKey, 80) },
    currency: { base, secondary, tertiary, syncMinutes: Math.round(syncMinutes), rounding, markup },
    tax: { vatId: str(t.vatId, 30).toUpperCase(), ossConsolidation: bool(t.ossConsolidation), zeroRating: bool(t.zeroRating), rows: taxRows },
    payments: {
      wireEnabled: bool(p.wireEnabled),
      bankName: str(p.bankName, 80),
      iban,
      bic,
      escrowLimit,
      cardEnabled: bool(p.cardEnabled),
      cardMethods: [...new Set(methods)],
      escrowThreshold,
    },
    shipping: { carriers, escortTier, freeThreshold },
    orders: { prefix, graceMinutes: Math.round(graceMinutes), maxUnverified, clearanceHours: Math.round(clearanceHours) },
    inventory: {
      lowStockDefault: Math.round(lowStockDefault),
      reorderBufferDays: Math.round(reorderBufferDays),
      vaultSyncMinutes: Math.round(vaultSyncMinutes),
      autoQuarantine: bool(i.autoQuarantine),
      barcodeVerify: bool(i.barcodeVerify),
    },
    security: { requireFido2: bool(sec.requireFido2), physicalPresence: bool(sec.physicalPresence), sessionTimeoutMinutes: Math.round(sessionTimeoutMinutes), ipAllowlist: ips.join("\n") },
    integrations: { webhookUrl, slackAlerts: bool(g("integrations").slackAlerts) },
    email: { smtpHost, smtpPort: Math.round(smtpPort), fromName: str(m.fromName, 80), fromAddress, transmitProofs: bool(m.transmitProofs), signatoryAlerts: bool(m.signatoryAlerts) },
    seo: { defaultTitle: str(seo.defaultTitle, 70), defaultDescription: str(seo.defaultDescription, 200), schemaOrg: bool(seo.schemaOrg), sitemap: bool(seo.sitemap) },
    ergonomics: { haptic: bool(ergo.haptic), highContrast: bool(ergo.highContrast) },
  };
};

// --- Writes ---

export const writeSettings = (next: Settings): SettingsResponse => {
  settings = next;
  updatedAt = new Date().toISOString();
  updatedBy = "E. Vanderbilt";
  return readSettings();
};

export const rotateSecret = (): SettingsResponse => {
  secretLast4 = Math.random().toString(16).slice(2, 6).toUpperCase().padEnd(4, "0");
  secretRotatedAt = new Date().toISOString();
  return readSettings();
};
