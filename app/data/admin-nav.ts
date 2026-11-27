import type { AdminNavItem } from "~/types/admin/admin-nav";

// Labels are getters so they are translated when read, in the current language.
export const adminNav: AdminNavItem[] = [
  { to: "/", get label() { return tr("nav.dashboard"); }, icon: "lucide:layout-dashboard" },
  {
    to: "/analytics",
    get label() { return tr("nav.analytics"); },
    icon: "lucide:chart-no-axes-combined",
  },
  { to: "/orders", get label() { return tr("nav.orders"); }, icon: "lucide:receipt-text" },
  { to: "/customers", get label() { return tr("nav.customers"); }, icon: "lucide:contact-round" },
  { to: "/products", get label() { return tr("nav.products"); }, icon: "lucide:package" },
  { to: "/categories", get label() { return tr("nav.categories"); }, icon: "lucide:folder-tree" },
  { to: "/inventory", get label() { return tr("nav.inventory"); }, icon: "lucide:warehouse" },
  { to: "/coupons", get label() { return tr("nav.coupons"); }, icon: "lucide:ticket-percent" },
  { to: "/content", get label() { return tr("nav.content"); }, icon: "lucide:panels-top-left" },
];
