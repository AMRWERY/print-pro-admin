export interface AdminNavItem {
  to: string;
  label: string;
  icon: string;
}

export const adminNav: AdminNavItem[] = [
  { to: "/", label: "Dashboard", icon: "lucide:layout-dashboard" },
  { to: "/orders", label: "Orders", icon: "lucide:receipt-text" },
  { to: "/customers", label: "Customers", icon: "lucide:contact-round" },
  { to: "/products", label: "Products", icon: "lucide:package" },
  { to: "/categories", label: "Categories", icon: "lucide:folder-tree" },
  { to: "/coupons", label: "Coupons", icon: "lucide:ticket-percent" },
  { to: "/inventory", label: "Inventory", icon: "lucide:warehouse" },
  { to: "/analytics", label: "Analytics", icon: "lucide:chart-no-axes-combined" },
];
