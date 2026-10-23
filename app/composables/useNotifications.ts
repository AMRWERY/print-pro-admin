import type { AdminNotification } from "~/types/notifications";

// Demo feed. When the app has a backend this seed goes away and the list comes from the API.
const seed = (): AdminNotification[] => [
  { id: 1, kind: "order", title: "New order #LP-948202", body: "Dr. Amal Fahmy placed a EGP 71,690 order.", ago: "5 min ago", read: false, to: "/orders" },
  { id: 2, kind: "stock", title: "Low stock: Kopira Toner Black A3", body: "2 units left, below the minimum of 5.", ago: "42 min ago", read: false, to: "/inventory" },
  { id: 3, kind: "payment", title: "Payment received", body: "Cairo Language School paid EGP 27,400.", ago: "2 h ago", read: false, to: "/orders" },
  { id: 4, kind: "customer", title: "New customer", body: "Nile Print House verified their account.", ago: "Yesterday", read: true, to: "/customers" },
  { id: 5, kind: "stock", title: "Restock arrived", body: "40 Corex Toner Black 210 cartridges are in the Cairo warehouse.", ago: "Yesterday", read: true, to: "/inventory" },
];

/** Shared notification list for the header bell and its dialog. */
export const useNotifications = () => {
  const items = useState<AdminNotification[]>("admin-notifications", seed);

  /** Whether the side panel is open (the bell lives in the header, the panel in the layout). */
  const open = useState("admin-notifications-open", () => false);

  const unread = computed(() => items.value.filter((n) => !n.read).length);

  const markRead = (id: number) => {
    const n = items.value.find((x) => x.id === id);
    if (n) n.read = true;
  };
  const markAllRead = () => {
    items.value.forEach((n) => (n.read = true));
  };
  const clear = () => {
    items.value = [];
  };

  return { items, unread, open, markRead, markAllRead, clear };
};
