import { allPermissions } from "~/data/users-meta";
import type {
  Operator,
  OperatorBulkAction,
  OperatorInput,
  OperatorQuery,
  OperatorRow,
  OperatorStatus,
  OperatorsResponse,
  Role,
  RoleInput,
  RoleRow,
} from "~/types/admin/users";

// Demo operator book and role book. When the app has a backend this file goes away and
// server/api/admin/users/* and roles/* proxy the real service.

const NOW = Date.parse("2026-10-31T12:00:00Z");
const MIN = 60_000;
const ago = (minutes: number) => new Date(NOW - minutes * MIN).toISOString();

export const SUPER_ROLE = "role-root";

const perms = (...list: string[]) => list;
const modulePerms = (m: string, ...ids: string[]) => ids.map((i) => `${m}.${i}`);

const roles: Role[] = [
  {
    id: SUPER_ROLE,
    name: "Super Curator",
    code: "ROLE-ROOT-01",
    description: "Root access across every module. Cannot be edited; at least one active holder must remain.",
    scope: "Global",
    system: true,
    permissions: [...allPermissions],
  },
  {
    id: "role-metrology",
    name: "Hardware Metrologist & Cleanroom QA",
    code: "ROLE-METROLOGY-02",
    description: "Owns the product register and the vault: calibration, stock holds and storefront publishing.",
    scope: "Lab-specific",
    system: false,
    permissions: perms(
      ...modulePerms("products", "view", "create", "edit", "publish"),
      ...modulePerms("orders", "view", "hold"),
      ...modulePerms("customers", "view"),
      ...modulePerms("inventory", "view", "adjust", "quarantine", "transfer"),
      ...modulePerms("reports", "view"),
    ),
  },
  {
    id: "role-escrow",
    name: "Escrow Officer",
    code: "ROLE-ESCROW-03",
    description: "Treasury and wire work: releases, refunds and escrow holds on requisitions.",
    scope: "Finance",
    system: false,
    permissions: perms(
      ...modulePerms("orders", "view", "fulfil", "refund", "hold"),
      ...modulePerms("customers", "view", "edit"),
      ...modulePerms("inventory", "view"),
      ...modulePerms("reports", "view", "export"),
    ),
  },
  {
    id: "role-cms",
    name: "CMS Lead",
    code: "ROLE-CMS-04",
    description: "Catalog and media: banners, featured blocks and product copy.",
    scope: "Content",
    system: false,
    permissions: perms(
      ...modulePerms("products", "view", "edit", "publish"),
      ...modulePerms("inventory", "view"),
      ...modulePerms("content", "view", "edit", "purge"),
      ...modulePerms("reports", "view"),
    ),
  },
  {
    id: "role-auditor",
    name: "Security Auditor",
    code: "ROLE-AUDIT-05",
    description: "Read-only access to every module for compliance reviews.",
    scope: "Read-only",
    system: false,
    permissions: perms(
      ...modulePerms("products", "view"),
      ...modulePerms("orders", "view"),
      ...modulePerms("customers", "view"),
      ...modulePerms("inventory", "view"),
      ...modulePerms("content", "view"),
      ...modulePerms("reports", "view", "export"),
      ...modulePerms("access", "view"),
    ),
  },
];

type Seed = Omit<Operator, "createdAt" | "isYou" | "keyEnrolled" | "sessions" | "failedAttempts"> &
  Partial<Pick<Operator, "keyEnrolled" | "sessions" | "failedAttempts">>;

const seeds: Seed[] = [
  { id: "ADM-0104", name: "E. Vanderbilt", email: "vanderbilt@lumenpress.ch", roleId: SUPER_ROLE, node: "zurich-executive-01", status: "active", lastSeen: ago(1), sessions: 2 },
  { id: "ADM-0882", name: "Dr. Aris Thorne", email: "thorne@cleanroom.lumenpress.ch", roleId: "role-metrology", node: "berlin-cleanroom-01", status: "active", lastSeen: ago(6), sessions: 1 },
  { id: "ADM-0329", name: "Margot Chen", email: "m.chen@treasury.lumenpress.ch", roleId: "role-escrow", node: "ny-treasury-node", status: "active", lastSeen: ago(14), sessions: 1 },
  { id: "ADM-0551", name: "Soren Kjaer", email: "kjaer@curation.lumenpress.ch", roleId: "role-cms", node: "cph-studio-edit", status: "idle", lastSeen: ago(42), sessions: 1 },
  { id: "ADM-0712", name: "Hélène Gautier", email: "gautier@paris.lumenpress.ch", roleId: "role-auditor", node: "paris-optical-lab", status: "active", lastSeen: ago(25), sessions: 1 },
  { id: "ADM-0901", name: "Kaelen Voss", email: "voss@external-audit.ch", roleId: "role-auditor", node: "remote-untrusted", status: "suspended", lastSeen: ago(60 * 26), sessions: 0, keyEnrolled: false, failedAttempts: 4 },
];

const NAMES = ["Ines Marchetti", "Tomas Reyes", "Priya Nandakumar", "Jonas Albrecht", "Yuki Tanabe", "Lena Hofmann", "Omar Haddad", "Clara Whitfield", "Viktor Sokolov", "Aiko Brandt"];
const NODES = ["zurich-vault-02", "berlin-qa-02", "lyon-print-room", "vienna-finance", "oslo-media-desk", "geneva-escrow-01", "milan-showroom", "ams-archive-03", "lisbon-support", "prague-lab-04"];
const ROLE_CYCLE = ["role-metrology", "role-escrow", "role-cms", "role-auditor", "role-cms", "role-metrology", "role-escrow", "role-auditor", "role-root", "role-cms"];

const generated: Seed[] = NAMES.map((name, k) => ({
  id: `ADM-${String(1100 + k * 37).padStart(4, "0")}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@lumenpress.ch`,
  roleId: ROLE_CYCLE[k]!,
  node: NODES[k]!,
  status: (k === 3 ? "idle" : k === 7 ? "suspended" : k % 4 === 2 ? "idle" : "active") as OperatorStatus,
  lastSeen: ago(k === 7 ? 60 * 50 : 8 + k * 23),
  sessions: k === 7 ? 0 : k % 3 === 0 ? 2 : 1,
  failedAttempts: k === 7 ? 2 : 0,
}));

const operators: Operator[] = [...seeds, ...generated].map((s, i) => ({
  keyEnrolled: true,
  sessions: 1,
  failedAttempts: 0,
  ...s,
  isYou: i === 0,
  createdAt: new Date(NOW - (400 - i * 17) * 86_400_000).toISOString(),
}));

let opSeq = 2000;
let roleSeq = 6;

// --- Reads ---

const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? "Unknown role";
const toRow = (o: Operator): OperatorRow => ({ ...o, roleName: roleName(o.roleId) });

const toRoleRow = (r: Role): RoleRow => ({ ...r, operators: operators.filter((o) => o.roleId === r.id).length });

export const listRoles = (): RoleRow[] => roles.map(toRoleRow);
export const findRole = (id: string) => roles.find((r) => r.id === id);
export const findOperator = (id: string) => operators.find((o) => o.id === id);

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

export const parseOperatorQuery = (raw: Record<string, unknown>): OperatorQuery => {
  const page = Number.parseInt(String(raw.page), 10);
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 80) : "",
    role: typeof raw.role === "string" && raw.role ? raw.role.slice(0, 40) : "all",
    status: pick(raw.status, ["all", "active", "idle", "suspended"] as const, "all"),
    page: Number.isFinite(page) ? Math.min(100_000, Math.max(1, page)) : 1,
    perPage: Number(pick(String(raw.perPage), ["8", "16", "32"] as const, "8")),
  };
};

export const queryOperators = (query: OperatorQuery): OperatorsResponse => {
  const q = query.q.toLowerCase();
  const filtered = operators.filter(
    (o) =>
      (query.role === "all" || o.roleId === query.role) &&
      (query.status === "all" || o.status === query.status) &&
      (!q || o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || o.node.toLowerCase().includes(q)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / query.perPage));
  const page = Math.min(query.page, pages);
  const rows = filtered.slice((page - 1) * query.perPage, page * query.perPage).map(toRow);

  const keyed = operators.filter((o) => o.keyEnrolled).length;
  return {
    rows,
    total: filtered.length,
    page,
    perPage: query.perPage,
    kpis: {
      total: operators.length,
      active: operators.filter((o) => o.status === "active").length,
      idle: operators.filter((o) => o.status === "idle").length,
      suspended: operators.filter((o) => o.status === "suspended").length,
      roles: roles.length,
      systemRoles: roles.filter((r) => r.system).length,
      keyed,
      keyPct: operators.length ? Math.round((keyed / operators.length) * 1000) / 10 : 0,
      incidents: operators.reduce((n, o) => n + o.failedAttempts, 0),
      sessions: operators.reduce((n, o) => n + o.sessions, 0),
    },
  };
};

// --- Validation ---

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validateOperator = (body: unknown): OperatorInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, 80);
  const email = str(b.email, 120).toLowerCase();
  const roleId = str(b.roleId, 40);
  const node = str(b.node, 60).toLowerCase().replace(/\s+/g, "-");
  if (name.length < 2 || !EMAIL.test(email) || !findRole(roleId)) return null;
  if (node && !/^[a-z0-9][a-z0-9-]{1,59}$/.test(node)) return null;
  return { name, email, roleId, node, status: pick(b.status, ["active", "suspended"] as const, "active") };
};

export const validateRole = (body: unknown): RoleInput | null => {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = str(b.name, 60);
  if (name.length < 2) return null;
  const given = Array.isArray(b.permissions) ? b.permissions : [];
  if (given.some((p) => typeof p !== "string" || !allPermissions.includes(p))) return null;
  return {
    name,
    description: str(b.description, 240),
    scope: str(b.scope, 30) || "Lab-specific",
    permissions: allPermissions.filter((p) => given.includes(p)),
  };
};

export const emailTaken = (email: string, exceptId?: string) =>
  operators.some((o) => o.email === email && o.id !== exceptId);

// --- Guardrails ---

/** Active Super Curators other than `exceptId`. At least one must always remain. */
const otherActiveSupers = (exceptIds: string[]) =>
  operators.filter((o) => o.roleId === SUPER_ROLE && o.status !== "suspended" && !exceptIds.includes(o.id)).length;

export type WriteResult<T> = { ok: true; value: T } | { ok: false; reason: "not-found" | "self" | "last-super" | "role-in-use" | "locked" };

// --- Operator writes ---

export const createOperator = (input: OperatorInput): OperatorRow => {
  const operator: Operator = {
    ...input,
    id: `ADM-${String(opSeq++).padStart(4, "0")}`,
    status: input.status,
    keyEnrolled: false,
    sessions: 0,
    failedAttempts: 0,
    lastSeen: new Date(NOW).toISOString(),
    isYou: false,
    createdAt: new Date(NOW).toISOString(),
  };
  operators.unshift(operator);
  return toRow(operator);
};

export const updateOperator = (id: string, input: OperatorInput): WriteResult<OperatorRow> => {
  const op = findOperator(id);
  if (!op) return { ok: false, reason: "not-found" };
  const demoted = op.roleId === SUPER_ROLE && (input.roleId !== SUPER_ROLE || input.status === "suspended");
  if (op.isYou && (input.roleId !== op.roleId || input.status === "suspended")) return { ok: false, reason: "self" };
  if (demoted && otherActiveSupers([id]) === 0) return { ok: false, reason: "last-super" };
  Object.assign(op, input);
  if (op.status === "suspended") op.sessions = 0;
  return { ok: true, value: toRow(op) };
};

/** Suspend, restore, revoke sessions or delete several operators. Skipped ones are protected by a guardrail. */
export const bulkOperators = (ids: string[], action: OperatorBulkAction): { changed: number; skipped: number } => {
  const chosen = operators.filter((o) => ids.includes(o.id));
  let changed = 0;
  let skipped = ids.length - chosen.length;
  const removing = chosen.filter((o) => o.roleId === SUPER_ROLE && o.status !== "suspended").map((o) => o.id);

  for (const o of chosen) {
    if (action === "suspend" || action === "delete") {
      const protectedSuper =
        o.roleId === SUPER_ROLE && o.status !== "suspended" && otherActiveSupers(removing.length ? removing : [o.id]) === 0;
      if (o.isYou || protectedSuper || (action === "suspend" && o.status === "suspended")) {
        skipped++;
        continue;
      }
    }
    if (action === "restore" && o.status !== "suspended") {
      skipped++;
      continue;
    }
    if (action === "delete") operators.splice(operators.indexOf(o), 1);
    else if (action === "suspend") {
      o.status = "suspended";
      o.sessions = 0;
    } else if (action === "restore") {
      o.status = "active";
      o.failedAttempts = 0;
    } else {
      o.sessions = o.isYou ? Math.min(o.sessions, 1) : 0;
    }
    changed++;
  }
  return { changed, skipped };
};

/** Ends every session except the signed-in admin's own. */
export const purgeSessions = (): number => {
  let ended = 0;
  for (const o of operators) {
    if (o.isYou) {
      ended += Math.max(0, o.sessions - 1);
      o.sessions = Math.min(o.sessions, 1);
    } else {
      ended += o.sessions;
      o.sessions = 0;
    }
  }
  return ended;
};

export const isBulkAction = (v: unknown): v is OperatorBulkAction =>
  v === "suspend" || v === "restore" || v === "revoke" || v === "delete";

// --- Role writes ---

const nextCode = () => `ROLE-CUSTOM-${String(roleSeq).padStart(2, "0")}`;

export const createRole = (input: RoleInput): RoleRow => {
  const role: Role = { ...input, id: `role-${roleSeq}`, code: nextCode(), system: false };
  roleSeq++;
  roles.push(role);
  return toRoleRow(role);
};

export const updateRole = (id: string, input: RoleInput): WriteResult<RoleRow> => {
  const role = findRole(id);
  if (!role) return { ok: false, reason: "not-found" };
  if (role.system) return { ok: false, reason: "locked" };
  Object.assign(role, input);
  return { ok: true, value: toRoleRow(role) };
};

export const deleteRole = (id: string): WriteResult<true> => {
  const role = findRole(id);
  if (!role) return { ok: false, reason: "not-found" };
  if (role.system) return { ok: false, reason: "locked" };
  if (operators.some((o) => o.roleId === id)) return { ok: false, reason: "role-in-use" };
  roles.splice(roles.indexOf(role), 1);
  return { ok: true, value: true };
};
