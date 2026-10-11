export interface AdminNavItem {
  to: string;
  labelKey: string;
  icon: string;
}

export interface AdminNavGroup {
  labelKey: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    labelKey: "admin.nav.controlPlane",
    items: [
      { to: "/", labelKey: "admin.nav.executiveBench", icon: "lucide:layout-dashboard" },
      { to: "/metrology-yield", labelKey: "admin.nav.metrology", icon: "lucide:chart-line" },
    ],
  },
  {
    labelKey: "admin.nav.substrates",
    items: [
      { to: "/camera-systems", labelKey: "admin.nav.cameraSystems", icon: "lucide:camera" },
      { to: "/cine-prime-glass", labelKey: "admin.nav.cineGlass", icon: "lucide:clapperboard" },
      { to: "/piezo-engines", labelKey: "admin.nav.piezoEngines", icon: "lucide:printer" },
      { to: "/cotton-rag-substrates", labelKey: "admin.nav.cottonRag", icon: "lucide:layers" },
      { to: "/pigment-chemistry", labelKey: "admin.nav.pigmentChemistry", icon: "lucide:flask-conical" },
    ],
  },
  {
    labelKey: "admin.nav.workflows",
    items: [
      { to: "/requisitions-escrow", labelKey: "admin.nav.requisitions", icon: "lucide:receipt-text" },
      { to: "/studio-dossiers", labelKey: "admin.nav.dossiers", icon: "lucide:contact-round" },
      { to: "/print-lab-configurator", labelKey: "admin.nav.configurator", icon: "lucide:sliders-horizontal" },
      { to: "/chain-of-custody", labelKey: "admin.nav.custody", icon: "lucide:link-2" },
      { to: "/system-parameters", labelKey: "admin.nav.parameters", icon: "lucide:settings" },
    ],
  },
];
