import type { Tone } from "~/types/admin/dashboard";
import type { OperatorStatus, PermissionModule } from "~/types/admin/users";

// Modules and privileges for the Users & Roles screen (no Tailwind classes, see order-meta.ts).
// The server uses the same list to check what a role may hold.
export const permissionModules: PermissionModule[] = [
  {
    id: "products",
    label: "Products & apparatus",
    icon: "lucide:package",
    privileges: [
      { id: "view", label: "View", hint: "See the product register" },
      { id: "create", label: "Create", hint: "Add new products" },
      { id: "edit", label: "Edit", hint: "Change product details and prices" },
      { id: "delete", label: "Delete", hint: "Remove products", sensitive: true },
      { id: "publish", label: "Publish", hint: "Push products live to the storefront" },
    ],
  },
  {
    id: "orders",
    label: "Orders & escrow",
    icon: "lucide:receipt-text",
    privileges: [
      { id: "view", label: "View", hint: "See orders and payments" },
      { id: "fulfil", label: "Fulfil", hint: "Pack and ship orders" },
      { id: "refund", label: "Refund", hint: "Refund or void a payment", sensitive: true },
      { id: "hold", label: "Escrow hold", hint: "Place or release an escrow hold", sensitive: true },
    ],
  },
  {
    id: "customers",
    label: "Customers & registries",
    icon: "lucide:contact-round",
    privileges: [
      { id: "view", label: "View", hint: "See customer dossiers" },
      { id: "edit", label: "Edit", hint: "Change customer details and tiers" },
      { id: "export", label: "Export PII", hint: "Download personal data", sensitive: true },
      { id: "override", label: "Tax override", hint: "Mark a customer tax exempt", sensitive: true },
    ],
  },
  {
    id: "inventory",
    label: "Inventory & vault",
    icon: "lucide:warehouse",
    privileges: [
      { id: "view", label: "View", hint: "See stock levels" },
      { id: "adjust", label: "Stock adjust", hint: "Correct stock counts" },
      { id: "quarantine", label: "Quarantine", hint: "Hold stock out of sale" },
      { id: "transfer", label: "Transfer", hint: "Move stock between locations" },
    ],
  },
  {
    id: "content",
    label: "Content & merchandising",
    icon: "lucide:panels-top-left",
    privileges: [
      { id: "view", label: "View", hint: "See banners and featured blocks" },
      { id: "edit", label: "Edit", hint: "Create, edit and reorder content" },
      { id: "purge", label: "Purge cache", hint: "Flush the storefront edge cache" },
    ],
  },
  {
    id: "reports",
    label: "Reports & telemetry",
    icon: "lucide:chart-no-axes-combined",
    privileges: [
      { id: "view", label: "View", hint: "See analytics" },
      { id: "export", label: "Export", hint: "Download reports" },
    ],
  },
  {
    id: "access",
    label: "Access control & settings",
    icon: "lucide:shield-check",
    privileges: [
      { id: "view", label: "View", hint: "See operators and roles" },
      { id: "manage", label: "Manage operators", hint: "Add, suspend and remove operators", sensitive: true },
      { id: "settings", label: "Edit settings", hint: "Change system parameters", sensitive: true },
    ],
  },
];

export const allPermissions: string[] = permissionModules.flatMap((m) =>
  m.privileges.map((p) => `${m.id}.${p.id}`),
);

export const permissionTotal = allPermissions.length;

export const statusMeta: Record<OperatorStatus, { label: string; tone: Tone; icon: string }> = {
  active: { label: "Active", tone: "success", icon: "lucide:circle-check" },
  idle: { label: "Idle", tone: "neutral", icon: "lucide:moon" },
  suspended: { label: "Suspended", tone: "accent", icon: "lucide:lock" },
};

export const statusOptions: { value: "all" | OperatorStatus; label: string }[] = [
  { value: "all", label: "Status: all" },
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "suspended", label: "Suspended" },
];

export const statusChoices = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended (cannot sign in)" },
];

export const scopeOptions = [
  { value: "Global", label: "Global" },
  { value: "Lab-specific", label: "Lab-specific" },
  { value: "Finance", label: "Finance" },
  { value: "Content", label: "Content" },
  { value: "Read-only", label: "Read-only" },
];

export const initialsOf = (name: string) =>
  name
    .replace(/^(dr|mr|ms|mrs)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
