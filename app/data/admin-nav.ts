import type { AdminNavItem } from "~/types/admin/admin-nav";

export const adminNav: AdminNavItem[] = [
  { to: "/", label: "Dashboard", icon: "lucide:layout-dashboard" },
  {
    to: "/analytics",
    label: "Analytics",
    icon: "lucide:chart-no-axes-combined",
  },
  { to: "/orders", label: "Orders", icon: "lucide:receipt-text" },
  { to: "/customers", label: "Customers", icon: "lucide:contact-round" },
  { to: "/products", label: "Products", icon: "lucide:package" },
  { to: "/categories", label: "Categories", icon: "lucide:folder-tree" },
  { to: "/inventory", label: "Inventory", icon: "lucide:warehouse" },
  { to: "/coupons", label: "Coupons", icon: "lucide:ticket-percent" },
  { to: "/content", label: "Content", icon: "lucide:panels-top-left" },
];
