import { defaultOrders } from "~/data/account";
import type { RequisitionOrder } from "~/types/account";

// Demo order history shown alongside orders placed through checkout. When the app has a
// backend this file goes away and the list comes from the API.

const placedAt: Record<string, string> = {
  "#LP-948201": "2025-10-26T14:15:00",
  "#LP-883109": "2025-10-18T16:40:00",
  "#LP-810442": "2025-09-02T11:22:00",
  "#LP-770412": "2025-08-29T09:00:00",
  "#LP-694205": "2025-08-18T14:15:00",
};

const extra: RequisitionOrder[] = [
  {
    id: "#LP-770412",
    title: "Phase One IQ4 150MP Achromatic Back",
    status: "recalled",
    statusLabel: "REFUNDED / RECALLED",
    badgeLabel: "CUSTOM MOUNT RECALL",
    amount: 44500,
    items: [
      {
        name: "Phase One IQ4 150MP Achromatic",
        thumb: "/img/prod-08.png",
        sku: "LP-PO-150AC",
        quantity: 1,
      },
    ],
  },
  {
    id: "#LP-694205",
    title: "Ilford Galerie Gold Fibre Gloss 310gsm (6 Master Rolls)",
    status: "delivered",
    statusLabel: "DELIVERED & ARCHIVED",
    badgeLabel: "SUBSTRATE VERIFIED",
    amount: 1827.0,
    items: [
      {
        name: "Ilford Galerie Gold Fibre Gloss 310gsm",
        thumb: "/img/prod-06.png",
        sku: "LP-IL-GF310",
        quantity: 6,
      },
    ],
  },
];

/** The five-order demo history, in the order the designs list them. */
export const demoOrderHistory = (): RequisitionOrder[] =>
  [...defaultOrders, ...extra].map((o) => ({ ...o, placedAt: placedAt[o.id] }));
