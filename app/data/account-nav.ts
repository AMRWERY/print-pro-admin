// One list drives the account sidebar (desktop) and the bottom bar (phones).

import type { AccountNavItem } from "~/types/account";

export const accountNav: AccountNavItem[] = [
  {
    key: "overview",
    label: "Dashboard",
    short: "Overview",
    to: "/account",
    icon: "lucide:layout-dashboard",
  },
  {
    key: "orders",
    label: "Orders & Calibrations",
    short: "Orders",
    to: "/account/orders",
    icon: "lucide:receipt-text",
  },
  {
    key: "registry",
    label: "Wishlist / Registry",
    short: "Registry",
    to: "/wishlist",
    icon: "lucide:bookmark",
  },
  {
    key: "vault",
    label: "Vault & Addresses",
    short: "Vault",
    to: "/account/profile#addresses",
    icon: "lucide:shield-check",
  },
  {
    key: "settings",
    label: "Account Settings",
    short: "Settings",
    to: "/account/profile",
    icon: "lucide:settings",
  },
];

/** Which item is "current" for a path (locale prefix included) and hash. */
export const isAccountNavActive = (
  key: AccountNavItem["key"] | string,
  path: string,
  hash: string,
) => {
  const p = path.replace(/^\/(en|ar)(?=\/|$)/, "").replace(/\/$/, "") || "/";
  switch (key) {
    case "overview":
      return p === "/account";
    case "orders":
      return p.startsWith("/account/orders");
    case "registry":
      return p === "/wishlist";
    case "vault":
      return p === "/account/profile" && hash === "#addresses";
    case "settings":
      return p === "/account/profile" && hash !== "#addresses";
    default:
      return false;
  }
};
