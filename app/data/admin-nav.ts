export interface AdminNavItem {
  to: string;
  label: string;
  icon: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    label: "Control plane",
    items: [
      { to: "/", label: "Executive bench", icon: "lucide:layout-dashboard" },
      { to: "/metrology-yield", label: "Metrology & yield", icon: "lucide:chart-line" },
    ],
  },
  {
    label: "Substrates & hardware",
    items: [
      { to: "/camera-systems", label: "Camera systems", icon: "lucide:camera" },
      { to: "/cine-prime-glass", label: "Cine & prime glass", icon: "lucide:clapperboard" },
      { to: "/piezo-engines", label: "Piezo engines", icon: "lucide:printer" },
      { to: "/cotton-rag-substrates", label: "Cotton rag substrates", icon: "lucide:layers" },
      { to: "/pigment-chemistry", label: "Pigment chemistry", icon: "lucide:flask-conical" },
    ],
  },
  {
    label: "Workflows & operations",
    items: [
      { to: "/requisitions-escrow", label: "Requisitions & escrow", icon: "lucide:receipt-text" },
      { to: "/studio-dossiers", label: "Studio dossiers", icon: "lucide:contact-round" },
      { to: "/print-lab-configurator", label: "Print lab configurator", icon: "lucide:sliders-horizontal" },
      { to: "/chain-of-custody", label: "Chain of custody", icon: "lucide:link-2" },
      { to: "/system-parameters", label: "System parameters", icon: "lucide:settings" },
    ],
  },
];
