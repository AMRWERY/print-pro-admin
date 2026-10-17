import { parseOrdersQuery, queryOrders } from "~/data/admin-orders";
import { initialsOf } from "~/data/customer-meta";
import { stageMeta } from "~/data/order-meta";
import type {
  Customer,
  CustomerActivity,
  CustomerDetail,
  CustomerInput,
  CustomerNote,
  CustomerQuery,
  CustomerSegment,
  CustomerSort,
  CustomerStatus,
  CustomerTier,
  CustomersResponse,
} from "~/types/admin/customers";

// Demo client registry. When the app has a backend this file goes away and
// server/api/admin/customers/* proxies the real service.

const DEMO_NOW = Date.UTC(2026, 9, 31, 15, 0, 0);
const DAY = 86_400_000;
const TOTAL = 1420;

const NODES = ["New York", "Paris", "London", "Tokyo", "Berlin", "Lyon", "Zurich", "Milan", "Amsterdam", "Vienna", "Stockholm", "Seoul"];

type Seed = Omit<Customer, "id" | "initials" | "createdAt" | "lastActivity" | "taxId" | "depot" | "escrowTerms"> & {
  taxId?: string;
};

const seeds: Seed[] = [
  { name: "Dr. Elena Vance", org: "The Metropolitan Museum of Art", role: "Chief Optical Conservator, Archival Imaging", email: "e.vance@metmuseum.org", phone: "+1 (212) 535-7710", node: "New York Node", segment: "institutional", tier: "AAA", status: "active", ltv: 142500, orders: 14, activeOrders: 1, escrowRating: 99.8, taxId: "US-EIN 13-1624021" },
  { name: "Henri De Vries", org: "L'Atelier Luminescence Paris", role: "Master Printer & Lead", email: "h.devries@luminescence.fr", phone: "+33 1 42 68 55 00", node: "Paris Node", segment: "printmaker", tier: "AA", status: "active", ltv: 18200, orders: 6, activeOrders: 0, escrowRating: 99.1 },
  { name: "Marcus Sterling", org: "Sterling Fine Art Archive London", role: "Director of Metrology", email: "m.sterling@sterling-archive.uk", phone: "+44 20 7946 0912", node: "London Node", segment: "institutional", tier: "AAA", status: "active", ltv: 36400, orders: 9, activeOrders: 0, escrowRating: 99.5 },
  { name: "Sophia Lin", org: "Kroma Cine Lab Tokyo", role: "Principal Cinematographer", email: "s.lin@kromacine.jp", phone: "+81 3 5555 0143", node: "Tokyo / Zurich Node", segment: "commercial", tier: "AA", status: "active", ltv: 12800, orders: 5, activeOrders: 0, escrowRating: 98.7 },
  { name: "Prof. Kenneth Bauer", org: "Bauhaus Heritage Berlin", role: "Head of Archival Preservation", email: "k.bauer@bauhaus-archive.de", phone: "+49 30 8892 4100", node: "Berlin Node", segment: "institutional", tier: "AAA", status: "active", ltv: 41200, orders: 11, activeOrders: 0, escrowRating: 99.6 },
  { name: "Claire Delacroix", org: "Atelier Baryta & Pigment Lyon", role: "Founder & Master Printer", email: "c.delacroix@atelierbaryta.com", phone: "+33 4 72 00 11 88", node: "Lyon Node", segment: "printmaker", tier: "A", status: "active", ltv: 9600, orders: 4, activeOrders: 0, escrowRating: 98.2 },
];

const FIRST = ["Amelie", "Jonas", "Ingrid", "Tomas", "Yuki", "Ravi", "Noor", "Lucas", "Mina", "Oskar", "Hana", "Pierre", "Sofia", "Daniel", "Aiko", "Marta", "Felix", "Leila", "Viktor", "Elise"];
const LAST = ["Hartmann", "Moreau", "Ishikawa", "Lindqvist", "Rossi", "Okafor", "Novak", "Tanaka", "Bergman", "Dubois", "Weiss", "Kovacs", "Aalto", "Marini", "Fischer", "Ibrahim", "Larsen", "Costa", "Petrov", "Haas"];
const ORG_BY_SEGMENT: Record<CustomerSegment, [string, string[]]> = {
  institutional: ["Museum of Photography", ["Archive", "Conservation Institute"]],
  commercial: ["Studio", ["Foundry", "Production House"]],
  printmaker: ["Atelier", ["Print Works", "Editions"]],
  collector: ["Private Collection", ["Foundation", "Vault"]],
  highLtv: ["Gallery Group", ["Holdings", "Trust"]],
};
const ROLE_BY_SEGMENT: Record<CustomerSegment, string[]> = {
  institutional: ["Head Conservator", "Collections Director", "Director of Imaging"],
  commercial: ["Studio Director", "Head of Post-Production", "Technical Producer"],
  printmaker: ["Master Printer", "Atelier Founder", "Print Studio Lead"],
  collector: ["Private Collector", "Collection Manager", "Patron"],
  highLtv: ["Managing Director", "Head of Acquisitions", "Chief Curator"],
};

// Segment sizes that add up to TOTAL once the six hand-picked clients are counted.
const SIZES: [CustomerSegment, number][] = [
  ["institutional", 240 - 3],
  ["commercial", 512 - 1],
  ["printmaker", 388 - 2],
  ["collector", 194],
  ["highLtv", 86],
];
const segmentOrder = SIZES.flatMap(([s, n]) => Array<CustomerSegment>(n).fill(s));
const GENERATED = TOTAL - seeds.length;

const LTV_RANGE: Record<CustomerSegment, [number, number]> = {
  institutional: [4000, 30000],
  commercial: [1000, 14000],
  printmaker: [800, 10000],
  collector: [2000, 25000],
  highLtv: [50000, 110000],
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");

const finish = (n: number, s: Seed, extra: { createdDaysAgo: number; idleHours: number }): Customer => {
  const city = s.node.split(/[ /]/)[0]!;
  return {
    ...s,
    id: `cu-${n}`,
    initials: initialsOf(s.name),
    lastActivity: new Date(DEMO_NOW - extra.idleHours * 3_600_000).toISOString(),
    createdAt: new Date(DEMO_NOW - extra.createdDaysAgo * DAY).toISOString(),
    taxId: s.taxId ?? `EIN ${10 + (n % 80)}-${1000000 + ((n * 7919) % 8999999)}`,
    depot: `Dock ${1 + (n % 9)}B, ${s.org}, ${city}`,
    escrowTerms: "Net-30 escrow lock (Deutsche Bank Luxembourg)",
  };
};

let instCount = 0;
const store: Customer[] = [
  ...seeds.map((s, i) => finish(i, s, { createdDaysAgo: 400 + i * 30, idleHours: 6 + i * 20 })),
  ...Array.from({ length: GENERATED }, (_, k) => {
    const n = seeds.length + k;
    const segment = segmentOrder[(k * 793) % GENERATED]!;
    const [word, endings] = ORG_BY_SEGMENT[segment];
    const first = FIRST[k % FIRST.length]!;
    const last = LAST[(k * 7 + Math.floor(k / 20)) % LAST.length]!;
    const city = NODES[(k * 5) % NODES.length]!;
    const [lo, hi] = LTV_RANGE[segment];
    const ltv = lo + ((k * 7919) % (hi - lo));
    const status: CustomerStatus = k % 33 === 7 ? "audit" : k % 10 === 3 ? "dormant" : "active";
    // 139 more institutional clients carry the top tier, which makes 142 with the hand-picked ones.
    const tier: CustomerTier =
      segment === "institutional" ? (instCount++ < 139 ? "AAA" : "AA") : segment === "commercial" && k % 3 === 0 ? "AA" : "A";
    const org = `${city} ${word} ${k % 2 ? endings[0] : endings[1]}`;
    return finish(
      n,
      {
        name: `${first} ${last}`,
        org,
        role: ROLE_BY_SEGMENT[segment][k % 3]!,
        email: `${slug(`${first} ${last}`)}@${slug(org).replace(/\./g, "").slice(0, 18)}.org`,
        phone: `+${[1, 33, 44, 81, 49][k % 5]} ${200 + (k % 700)} ${5000 + ((k * 31) % 4999)}`,
        node: `${city} Node`,
        segment,
        tier,
        status,
        ltv,
        orders: Math.round(ltv / 9000) + 1,
        activeOrders: k % 38 === 11 ? 1 : 0,
        escrowRating: Math.round((97 + (k % 30) / 10) * 10) / 10,
      },
      {
        // 41 clients joined within the last quarter.
        createdDaysAgo: k % 34 === 5 ? 3 + (k % 80) : 91 + ((k * 131) % 700),
        idleHours: status === "dormant" ? 24 * (120 + (k % 280)) : (k * 37) % 700,
      },
    );
  }),
];

let seq = TOTAL;
let clock = 0;

// --- Query ---

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export const parseCustomerQuery = (raw: Record<string, unknown>): CustomerQuery => {
  const page = Number.parseInt(String(raw.page), 10);
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 80) : "",
    segment: pick(raw.segment, ["all", "institutional", "commercial", "printmaker", "collector", "highLtv"] as const, "all"),
    status: pick(raw.status, ["all", "active", "audit", "dormant"] as const, "all"),
    activity: pick<CustomerActivity>(raw.activity, ["all", "7d", "30d", "90d"], "all"),
    sort: pick<CustomerSort>(raw.sort, ["spend", "spendLow", "name", "newest"], "spend"),
    page: Number.isFinite(page) ? Math.min(100_000, Math.max(1, page)) : 1,
    perPage: Number(pick(String(raw.perPage), ["10", "25", "50"] as const, "10")),
  };
};

export const queryCustomers = (query: CustomerQuery): CustomersResponse => {
  const needle = query.q.toLowerCase();
  const since = query.activity === "all" ? 0 : DEMO_NOW - { "7d": 7, "30d": 30, "90d": 90 }[query.activity] * DAY;

  // Segment counts follow the other filters but not the segment tab itself.
  const base = store.filter(
    (c) =>
      (!needle || [c.name, c.org, c.email, c.role, c.node, c.taxId].join(" ").toLowerCase().includes(needle)) &&
      (query.status === "all" || c.status === query.status) &&
      Date.parse(c.lastActivity) >= since,
  );

  const counts: CustomersResponse["counts"] = { all: base.length, institutional: 0, commercial: 0, printmaker: 0, collector: 0, highLtv: 0 };
  for (const c of base) counts[c.segment]++;

  const filtered = query.segment === "all" ? base : base.filter((c) => c.segment === query.segment);
  const order: Record<CustomerSort, (a: Customer, b: Customer) => number> = {
    spend: (a, b) => b.ltv - a.ltv,
    spendLow: (a, b) => a.ltv - b.ltv,
    name: (a, b) => a.name.localeCompare(b.name),
    newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  };
  const sorted = [...filtered].sort(order[query.sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / query.perPage));
  const page = Math.min(query.page, pageCount);

  const spend = store.reduce((sum, c) => sum + c.ltv, 0);
  return {
    rows: sorted.slice((page - 1) * query.perPage, page * query.perPage),
    total: sorted.length,
    counts,
    kpis: {
      total: store.length,
      newThisQuarter: store.filter((c) => Date.parse(c.createdAt) >= DEMO_NOW - 90 * DAY).length,
      retentionPct: 98.4,
      spend,
      avgLtv: store.length ? spend / store.length : 0,
      activeOrders: store.reduce((sum, c) => sum + c.activeOrders, 0),
      activeClients: new Set(store.map((c) => c.node)).size,
      vip: store.filter((c) => c.tier === "AAA").length,
    },
  };
};

// --- Detail, notes ---

const notes = new Map<string, CustomerNote[]>();
let noteSeq = 100;

notes.set("cu-0", [
  {
    id: 1,
    author: "COO Vanderbilt",
    urgent: true,
    at: new Date(DEMO_NOW - 9 * DAY).toISOString(),
    text: "Client requires all lens assemblies (Hasselblad XCD) to be bench-tested for MTF over 99% and signed by station QA before nitrogen sealing. Do not dispatch without Brink's Armored Courier.",
  },
]);

export const customerDetail = (id: string): CustomerDetail | null => {
  const c = store.find((x) => x.id === id);
  if (!c) return null;
  const recent = queryOrders(parseOrdersQuery({ q: c.name, perPage: "10", sort: "newest" })).rows.slice(0, 3);
  return {
    ...c,
    notes: notes.get(id) ?? [],
    recentOrders: recent.map((o) => ({
      id: o.id,
      title: o.allocation.title,
      amount: o.amount,
      placedAt: o.placedAt,
      stageLabel: stageMeta[o.stage].tab,
    })),
  };
};

export const addCustomerNote = (id: string, text: string, urgent: boolean): CustomerNote | null => {
  if (!store.some((c) => c.id === id)) return null;
  const note: CustomerNote = {
    id: ++noteSeq,
    author: "COO Admin (Station-01)",
    text,
    urgent,
    at: new Date(DEMO_NOW + 86_400_000 + ++clock * 60_000).toISOString(),
  };
  const list = notes.get(id) ?? [];
  // Urgent notes pin to the top; the rest follow newest first.
  notes.set(id, urgent ? [note, ...list] : [...list.filter((n) => n.urgent), note, ...list.filter((n) => !n.urgent)]);
  return note;
};

// --- Changes ---

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export const validateCustomer = (body: unknown): CustomerInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, 80);
  const org = str(b.org, 120);
  const email = str(b.email, 120).toLowerCase();
  if (name.length < 2 || org.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  return {
    name,
    org,
    role: str(b.role, 100),
    email,
    phone: str(b.phone, 30),
    node: str(b.node, 60) || "Unassigned Node",
    segment: pick<CustomerSegment>(b.segment, ["institutional", "commercial", "printmaker", "collector", "highLtv"], "commercial"),
    tier: pick<CustomerTier>(b.tier, ["AAA", "AA", "A"], "A"),
    status: pick<CustomerStatus>(b.status, ["active", "audit", "dormant"], "active"),
    taxId: str(b.taxId, 40),
    depot: str(b.depot, 200),
    escrowTerms: str(b.escrowTerms, 120) || "Net-30 escrow lock (Deutsche Bank Luxembourg)",
  };
};

export const emailTaken = (email: string, exceptId?: string) =>
  store.some((c) => c.email === email && c.id !== exceptId);

export const createCustomer = (input: CustomerInput): Customer => {
  const n = seq++;
  const now = new Date(DEMO_NOW + 86_400_000 + ++clock * 60_000).toISOString();
  const customer: Customer = {
    ...input,
    id: `cu-${n}`,
    initials: initialsOf(input.name),
    lastActivity: now,
    createdAt: now,
    ltv: 0,
    orders: 0,
    activeOrders: 0,
    escrowRating: 100,
  };
  store.unshift(customer);
  return customer;
};

export const updateCustomer = (id: string, input: CustomerInput): Customer | null => {
  const customer = store.find((c) => c.id === id);
  if (!customer) return null;
  Object.assign(customer, input, { initials: initialsOf(input.name) });
  return customer;
};

export const deleteCustomers = (ids: string[]): number => {
  const gone = new Set(ids);
  const before = store.length;
  for (let i = store.length - 1; i >= 0; i--) {
    if (gone.has(store[i]!.id)) {
      notes.delete(store[i]!.id);
      store.splice(i, 1);
    }
  }
  return before - store.length;
};

export const findCustomer = (id: string) => store.find((c) => c.id === id);
